import { ValidationError, validateResourceCallRequest, isNonEmptyString } from '../validation.js';

describe('Validation Utilities', () => {
  describe('isNonEmptyString', () => {
    const validStrings = [
      ['simple string', 'test'],
      ['string with spaces', '  test  '],
      ['numbers and special chars', '123-abc!'],
    ] as const;

    test.each(validStrings)('should return true for %s', (_, value) => {
      expect(isNonEmptyString(value)).toBe(true);
    });

    const invalidValues = [
      ['empty string', ''],
      ['whitespace only', '   '],
      ['null', null],
      ['undefined', undefined],
      ['number', 123],
      ['object', {}],
      ['array', []],
    ] as const;

    test.each(invalidValues)('should return false for %s', (_, value) => {
      expect(isNonEmptyString(value)).toBe(false);
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
          expect(error).toHaveProperty('message', 'Request must be an object');
          expect(error).toHaveProperty('code', 'VALIDATION_ERROR');
        }
      });

      it('should reject requests without params', () => {
        const request = {};

        try {
          validateResourceCallRequest(request);
          fail('Expected validation to throw');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error).toHaveProperty('message', 'Request must contain params');
          expect(error).toHaveProperty('code', 'VALIDATION_ERROR');
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
          expect(error).toHaveProperty('message', 'Request params must be an object');
          expect(error).toHaveProperty('code', 'VALIDATION_ERROR');
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
          expect(error).toHaveProperty('message', 'Request params must contain uri');
          expect(error).toHaveProperty('code', 'VALIDATION_ERROR');
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
          expect(error).toHaveProperty('message', 'Request uri must be a string');
          expect(error).toHaveProperty('code', 'VALIDATION_ERROR');
        }
      });

      it('should reject params with empty uri', () => {
        const request = {
          params: {
            uri: '',
          },
        };

        try {
          validateResourceCallRequest(request);
          fail('Expected validation to throw');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error).toHaveProperty('message', 'Request uri cannot be empty');
          expect(error).toHaveProperty('code', 'VALIDATION_ERROR');
        }
      });

      it('should reject params with whitespace-only uri', () => {
        const request = {
          params: {
            uri: '   ',
          },
        };

        try {
          validateResourceCallRequest(request);
          fail('Expected validation to throw');
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect(error).toHaveProperty('message', 'Request uri cannot be empty');
          expect(error).toHaveProperty('code', 'VALIDATION_ERROR');
        }
      });
    });
  });
}); 