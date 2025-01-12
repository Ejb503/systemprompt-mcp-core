import { parseResourceUri, createResourceUri, ResourceUriError } from '../uri-parser.js';
import { ResourceType } from '../../config/resource-types.js';

describe('URI Parser', () => {
  // Helper function to validate error scenarios
  const expectResourceError = (
    action: () => void,
    expectedMessage: RegExp | string,
    expectedCode: 'INVALID_RESOURCE_TYPE' | 'INVALID_RESOURCE_ID' = 'INVALID_RESOURCE_ID'
  ) => {
    expect(action).toThrow(ResourceUriError);
    expect(action).toThrow(expectedMessage);
    expect(action).toThrow(expect.objectContaining({ code: expectedCode }));
  };

  describe('parseResourceUri', () => {
    it('should parse URI with valid block type and hyphenated ID', () => {
      const result = parseResourceUri('resource:///block/123-abc');
      expect(result).toEqual({
        type: 'block',
        id: '123-abc',
      });
    });

    describe('case sensitivity handling', () => {
      const invalidCases = [
        ['uppercase type', 'resource:///BLOCK/123', 'BLOCK'],
        ['mixed case type', 'resource:///BlOcK/123', 'BlOcK'],
        ['uppercase id allowed', 'resource:///block/ABC-123', null],
        ['mixed case id allowed', 'resource:///block/aBc-123', null],
      ] as const;

      test.each(invalidCases)('should handle %s', (_, uri, invalidType) => {
        if (invalidType) {
          expectResourceError(
            () => parseResourceUri(uri),
            `Unsupported resource type: ${invalidType}`,
            'INVALID_RESOURCE_TYPE'
          );
        } else {
          // Should not throw for valid case variations in ID
          expect(() => parseResourceUri(uri)).not.toThrow();
        }
      });
    });

    describe('error handling', () => {
      const invalidUris = [
        ['empty string', '', /Invalid resource URI format/],
        ['missing resource prefix', '///block/123', /Invalid resource URI format/],
        ['wrong scheme', 'https:///block/123', /Invalid resource URI format/],
        ['missing slashes', 'resource:/block/123', /Invalid resource URI format/],
        ['missing type', 'resource:///', /Invalid resource URI format/],
        ['missing id', 'resource:///block', /Invalid resource URI format/],
        ['invalid type characters', 'resource:///block@/123', /Invalid resource URI format/],
        ['invalid id characters', 'resource:///block/123@', /Invalid resource ID format/],
        ['extra segments', 'resource:///block/123/extra', /Invalid resource URI format/],
        ['query parameters', 'resource:///block/123?param=value', /Invalid resource URI format/],
        ['fragment identifier', 'resource:///block/123#fragment', /Invalid resource URI format/],
      ] as const;

      test.each(invalidUris)('should reject %s', (_, uri, expectedError) => {
        expectResourceError(() => parseResourceUri(uri), expectedError);
      });

      it('should reject unsupported resource types', () => {
        expectResourceError(
          () => parseResourceUri('resource:///unknown/123'),
          'Unsupported resource type: unknown',
          'INVALID_RESOURCE_TYPE'
        );
      });

      describe('invalid IDs', () => {
        const invalidIds = [
          ['empty', 'resource:///block/', /Invalid resource ID format/],
          ['special characters', 'resource:///block/123@abc', /Invalid resource ID format/],
          ['starting with hyphen', 'resource:///block/-123', /Invalid resource ID format/],
          ['ending with hyphen', 'resource:///block/123-', /Invalid resource ID format/],
          ['consecutive hyphens', 'resource:///block/123--abc', /Invalid resource ID format/],
          ['too long', `resource:///block/${'1'.repeat(129)}`, /Invalid resource ID format/],
        ] as const;

        test.each(invalidIds)('should reject ID %s', (_, uri, expectedError) => {
          expectResourceError(() => parseResourceUri(uri), expectedError);
        });
      });
    });
  });

  describe('createResourceUri', () => {
    it('should create valid URI from block type and alphanumeric ID', () => {
      const uri = createResourceUri('block', '123-abc');
      expect(uri).toBe('resource:///block/123-abc');
    });

    describe('case sensitivity handling', () => {
      const invalidCases = [
        ['uppercase type', 'BLOCK' as ResourceType, '123'],
        ['mixed case type', 'BlOcK' as ResourceType, '123'],
      ] as const;

      const validCases = [
        ['uppercase id', 'block' as ResourceType, 'ABC-123'],
        ['mixed case id', 'block' as ResourceType, 'aBc-123'],
      ] as const;

      test.each(invalidCases)('should reject %s', (_, type, id) => {
        expectResourceError(
          () => createResourceUri(type, id),
          `Unsupported resource type: ${type}`,
          'INVALID_RESOURCE_TYPE'
        );
      });

      test.each(validCases)('should allow %s', (_, type, id) => {
        expect(() => createResourceUri(type, id)).not.toThrow();
      });
    });

    describe('error handling', () => {
      it('should reject unsupported resource types', () => {
        expectResourceError(
          () => createResourceUri('unknown' as ResourceType, '123'),
          'Unsupported resource type: unknown',
          'INVALID_RESOURCE_TYPE'
        );
      });

      describe('invalid IDs', () => {
        const invalidIds = [
          ['empty string', ''],
          ['whitespace only', '   '],
          ['special characters', '123@abc'],
          ['spaces', '123 abc'],
          ['unicode characters', '123🚀abc'],
          ['starting with hyphen', '-123'],
          ['ending with hyphen', '123-'],
          ['consecutive hyphens', '123--abc'],
          ['too long', '1'.repeat(129)],
        ] as const;

        test.each(invalidIds)('should reject ID with %s', (_, id) => {
          expectResourceError(() => createResourceUri('block', id), /Invalid resource ID format/);
        });
      });
    });
  });

  describe('roundtrip', () => {
    const validCases = [
      ['simple id', 'resource:///block/123-abc'],
      ['uppercase id', 'resource:///block/ABC-123'],
      ['mixed case id', 'resource:///block/aBc-123'],
      ['multiple hyphens', 'resource:///block/abc-123-def'],
      ['numbers only', 'resource:///block/123'],
      ['letters only', 'resource:///block/abc'],
    ] as const;

    test.each(validCases)('should maintain data integrity with %s', (_, uri) => {
      const { type, id } = parseResourceUri(uri);
      const recreatedUri = createResourceUri(type, id);
      expect(recreatedUri).toBe(uri);
    });
  });

  describe('edge cases', () => {
    describe('maximum allowed special characters', () => {
      it('should allow maximum number of hyphens in valid ID', () => {
        // Testing ID with maximum allowed hyphens while maintaining valid format
        const complexId = 'a-b-c-d-e-f-g-h-i-j';
        expect(() => parseResourceUri(`resource:///block/${complexId}`)).not.toThrow();
        expect(() => createResourceUri('block', complexId)).not.toThrow();
      });
    });

    describe('boundary conditions', () => {
      it('should handle IDs at maximum allowed length', () => {
        // 128 characters is the maximum length for IDs
        const maxLengthId = 'a'.repeat(128);
        expect(() => parseResourceUri(`resource:///block/${maxLengthId}`)).not.toThrow();
        expect(() => createResourceUri('block', maxLengthId)).not.toThrow();
      });

      it('should handle IDs with mixed alphanumeric and hyphens at max length', () => {
        // Creating a complex ID at max length with mixed content
        const complexMaxId = 'a1-'.repeat(42) + 'a1'; // 128 characters
        expect(() => parseResourceUri(`resource:///block/${complexMaxId}`)).not.toThrow();
        expect(() => createResourceUri('block', complexMaxId)).not.toThrow();
      });
    });
  });
}); 