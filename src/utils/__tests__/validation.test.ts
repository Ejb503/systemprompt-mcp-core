import { ValidationError, validateResourceCallRequest, isNonEmptyString, validateNonEmptyString } from '../validation.js';

describe('Validation Utilities', () => {
  describe('isNonEmptyString', () => {
    const validStrings = [
      ['simple string', 'test'],
      ['string with spaces', '  test  '],
      ['numbers and special chars', '123-abc!'],
      ['unicode characters', 'hello🌍'],
      ['non-ASCII characters', 'café'],
      ['single character', 'x'],
      ['multiple lines', 'line1\nline2'],
      ['tabs and spaces', '\t test \t'],
      ['special characters only', '!@#$%'],
    ] as const;

    test.each(validStrings)('should return true for %s', (_, value) => {
      expect(isNonEmptyString(value)).toBe(true);
    });

    const invalidValues: [string, any][] = [
      ['empty string', ''],
      ['whitespace only', '   '],
      ['tabs only', '\t\t'],
      ['newlines only', '\n\r'],
      ['zero-width space', '\u200B'],
      ['null', null],
      ['undefined', undefined],
      ['number', 123],
      ['boolean', true],
      ['object', {}],
      ['array', []],
      ['NaN', NaN],
      ['Infinity', Infinity],
      ['Symbol', Symbol('test')],
    ] as const;

    test.each(invalidValues)('should return false for %s', (_, value) => {
      expect(isNonEmptyString(value)).toBe(false);
    });
  });

  describe('validateNonEmptyString', () => {
    it('should pass for valid strings', () => {
      const validStrings = [
        'hello',
        '  trimmed  ',
        '123',
        'special!@#',
        'hello🌍',
        'café',
      ];

      validStrings.forEach(str => {
        expect(() => validateNonEmptyString(str, 'test')).not.toThrow();
      });
    });

    it('should throw for non-string values', () => {
      const invalidValues = [
        null,
        undefined,
        123,
        true,
        {},
        [],
        Symbol('test'),
      ];

      invalidValues.forEach(value => {
        expect(() => validateNonEmptyString(value, 'test')).toThrow(ValidationError);
        expect(() => validateNonEmptyString(value, 'test')).toThrow('test must be a string');
      });
    });

    it('should throw for empty or whitespace-only strings', () => {
      const emptyStrings = [
        '',
        '   ',
        '\t\t',
        '\n\r',
        '\u200B', // zero-width space
      ];

      emptyStrings.forEach(str => {
        expect(() => validateNonEmptyString(str, 'test')).toThrow(ValidationError);
        expect(() => validateNonEmptyString(str, 'test')).toThrow('test cannot be empty or contain only whitespace');
      });
    });

    it('should preserve error code', () => {
      try {
        validateNonEmptyString('', 'test');
        fail('Expected validation to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        if (error instanceof ValidationError) {
          expect(error.code).toBe('VALIDATION_ERROR');
        }
      }
    });
  });

  describe('validateResourceCallRequest', () => {
    it('should validate a valid request', () => {
      const request = {
        params: {
          uri: 'resource:///block/123',
        },
      };

      expect(() => validateResourceCallRequest(request)).not.toThrow();
    });

    describe('error handling', () => {
      const invalidRequests = [
        ['null', null],
        ['undefined', undefined],
        ['string', 'string'],
        ['number', 123],
        ['array', []],
      ] as const;

      test.each(invalidRequests)('should reject %s request', (_, request) => {
        try {
          validateResourceCallRequest(request);
          fail('Expected validation to throw');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          if (error instanceof ValidationError) {
            expect(error.message).toBe('Request must be an object');
            expect(error.code).toBe('VALIDATION_ERROR');
          }
        }
      });

      it('should reject requests without params', () => {
        const request = {};

        try {
          validateResourceCallRequest(request);
          fail('Expected validation to throw');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          if (error instanceof ValidationError) {
            expect(error.message).toBe('Request must contain params');
            expect(error.code).toBe('VALIDATION_ERROR');
          }
        }
      });

      it('should reject requests with non-object params', () => {
        const request = {
          params: 'not an object',
        };

        try {
          validateResourceCallRequest(request);
          fail('Expected validation to throw');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          if (error instanceof ValidationError) {
            expect(error.message).toBe('Request params must be an object');
            expect(error.code).toBe('VALIDATION_ERROR');
          }
        }
      });

      it('should reject params without uri', () => {
        const request = {
          params: {},
        };

        try {
          validateResourceCallRequest(request);
          fail('Expected validation to throw');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          if (error instanceof ValidationError) {
            expect(error.message).toBe('Request params must contain uri');
            expect(error.code).toBe('VALIDATION_ERROR');
          }
        }
      });

      it('should reject params with non-string uri', () => {
        const request = {
          params: {
            uri: 123,
          },
        };

        try {
          validateResourceCallRequest(request);
          fail('Expected validation to throw');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          if (error instanceof ValidationError) {
            expect(error.message).toBe('Request uri must be a string');
            expect(error.code).toBe('VALIDATION_ERROR');
          }
        }
      });

      describe('uri format validation', () => {
        const invalidUris = [
          ['empty string', ''],
          ['whitespace only', '   '],
          ['spaces in middle', 'resource:///block/123 456'],
          ['spaces at start', ' resource:///block/123'],
          ['spaces at end', 'resource:///block/123 '],
          ['special characters', 'resource:///block/123@#$'],
          ['unicode characters', 'resource:///block/123🚀'],
          ['very long id', `resource:///block/${'a'.repeat(129)}`],
          ['backslashes', 'resource:\\\\block\\123'],
          ['missing protocol', '///block/123'],
          ['wrong protocol', 'https:///block/123'],
          ['missing slashes', 'resource:/block/123'],
          ['extra slashes', 'resource:////block/123'],
          ['missing type', 'resource:///'],
          ['missing id', 'resource:///block'],
          ['trailing slash', 'resource:///block/123/'],
          ['query parameters', 'resource:///block/123?param=value'],
          ['fragment identifier', 'resource:///block/123#fragment'],
          ['encoded characters', 'resource:///block/123%20abc'],
        ] as const;

        test.each(invalidUris)('should reject uri with %s', (_, uri) => {
          const request = {
            params: { uri },
          };

          try {
            validateResourceCallRequest(request);
            fail('Expected validation to throw');
          } catch (error) {
            expect(error).toBeInstanceOf(ValidationError);
            if (error instanceof ValidationError) {
              expect(error.code).toBe('VALIDATION_ERROR');
              // Check that error message is descriptive
              expect(error.message).toMatch(/^Request uri (must be a string|cannot be empty|cannot be empty or contain only whitespace|has invalid format)$/);
            }
          }
        });

        it('should validate uri length limits', () => {
          // Test maximum valid length
          const maxValidUri = `resource:///block/${'a'.repeat(128)}`;
          expect(() => validateResourceCallRequest({
            params: { uri: maxValidUri }
          })).not.toThrow();

          // Test exceeding maximum length
          const tooLongUri = `resource:///block/${'a'.repeat(129)}`;
          expect(() => validateResourceCallRequest({
            params: { uri: tooLongUri }
          })).toThrow(ValidationError);
        });
      });
    });
  });
});