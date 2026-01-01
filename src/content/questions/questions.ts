export const options = ['valid', 'maybe valid', 'invalid'] as const;
export type Option = (typeof options)[number];

export type Question = {
	json: string;
	explanation: string;
	answer: Option;
	citation: string;
};

export const questions: Question[] = [
	{
		json: '{  "am i"    : "valid?"  }',
		explanation: 'Whitespace is allowed between all JSON tokens',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-2',
		answer: 'valid',
	},
	{
		json: '{ hello: "world" }',
		explanation: "Object keys must be strings—this isn't JavaScript!",
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-4',
		answer: 'invalid',
	},
	{
		json: '[',
		explanation: 'Arrays must be closed with a closing square bracket (`]`)',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-5',
		answer: 'invalid',
	},
	{
		json: 'true',
		explanation:
			'Top level scalars are chill. `true`, `false`, `null`, objects, numbers, strings and arrays are all valid top level JSON values as of RFC7158',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-3',
		answer: 'valid',
	},
	{
		json: 'True',
		explanation:
			"Literal names must be exactly `true`, `false`, or `null`. I'm sorry Python and Haskell devs",
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-3',
		answer: 'invalid',
	},
	{
		json: '10',
		explanation: 'Scalars are still chill. 10 is a valid integer',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-6',
		answer: 'valid',
	},
	{
		json: '-10',
		explanation: 'Negative numbers are cool',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-6',
		answer: 'valid',
	},
	{
		json: '+10',
		explanation:
			"Leading plus sign on integers is not good 😔. This still isn't JavaScript",
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-6',
		answer: 'invalid',
	},
	{
		json: '0006',
		explanation: 'Leading zeros are not allowed in integers',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-6',
		answer: 'invalid',
	},
	{
		json: '6.0000',
		explanation:
			'Decimal numbers with fractional part are valid. Leading zeros signify precision here',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-6',
		answer: 'valid',
	},
	{
		json: '0x10',
		explanation:
			"Hexadecimal is not allowed in numbers. If you thought this was multiplication—that's not allowed either",
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-6',
		answer: 'invalid',
	},
	{
		json: '0.00000E0000',
		explanation:
			"Exponent part may include leading zeros. I don't know why you'd do that but you can I guess",
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-6',
		answer: 'valid',
	},
	{
		json: '-0',
		explanation: 'Negative zero is allowed',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-6',
		answer: 'valid',
	},
	{
		json: '5.',
		explanation: 'Fractional part must have one or more digits',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-6',
		answer: 'invalid',
	},
	{
		json: '28828283828383838288282282828282828282828282828387374747474747474747447473733773737377373737372882818192.093290230990392399230239039290',
		explanation:
			'IEEE 754 float doubles are recommended, but parsers can choose to accept arbitrarily high precision or accept very low precision. Does that mean pretty much any syntactically valid number is maybe valid? Yep—still not marking every number as maybe valid though',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-6',
		answer: 'maybe valid',
	},
	{
		json: 'NaN',
		explanation:
			'`NaN` is not a valid JSON number literal. Despite recommending using the IEEE 754 float double range, special values like `NaN` are forbidden. Obligatory "this isn\'t JavaScript"',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-6',
		answer: 'invalid',
	},
	{
		json: '/* comment */ {"a":1}',
		explanation:
			"Comments are not part of JSON. Parsers are technically free to accept extensions, but I'm still not counting this as valid. Fight me",
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-9',
		answer: 'invalid',
	},
	{
		json: '"line\u2028separator"',
		explanation:
			'`U+2028` and `U+2029` may appear in JSON strings. Fun fact, JavaScript does not allow these characters, so sorry to say, JSON is not a strict subset of JavaScript despite the goals of the format',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'valid',
	},
	{
		json: '[10,]',
		explanation:
			'Trailing commas aren\'t valid even if many parsers decide to accept them. Obligatory "I-know-extensions-exist-fight-me"',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-5',
		answer: 'invalid',
	},
	{
		json: '[[[[[[[[[[[[[[[[[[[[\n[[[[[[[[[[[[[[[[[[[[\n"this is balanced"\n]]]]]]]]]]]]]]]]]]]]\n]]]]]]]]]]]]]]]]]]]]\n',
		explanation:
			'Parsers can set limits on nesting and input size. Does this mean almost any input is maybe valid? Yep. Am I going to change the rest of the quiz? Nah',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259',
		answer: 'maybe valid',
	},
	{
		json: '{ "hi": null, "hi": null }',
		explanation:
			"You sure can have duplicate keys, but please don't unless you really like interoperability issues.",
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-4',
		answer: 'valid',
	},
	{
		json: '"pretend I\'m UTF-8 encoded"',
		explanation: 'UTF-8 is the default encoding and very swell',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-8.1',
		answer: 'valid',
	},
	{
		json: '"pretend I\'m UTF-16 encoded"',
		explanation:
			"UTF-16 is allowed in internal systems that don't go over the network",
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-8.1',
		answer: 'maybe valid',
	},
	{
		json: '"pretend I\'m UTF-32 encoded"',
		explanation:
			"UTF-32 is allowed in internal systems that don't go over the network",
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-8.1',
		answer: 'maybe valid',
	},
	{
		json: '"pretend I\'m UTF-7 encoded"',
		explanation: 'UTF-7 is not very swell',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-8.1',
		answer: 'invalid',
	},
	{
		json: '\ufeff"prefixed by byte order marker (BOM)"',
		explanation:
			'A leading byte order mark (BOM) is allowed in non-network-transmitted JSON and can be ignored in network-transmitted JSON',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-8.1',
		answer: 'maybe valid',
	},
	{
		json: '"\\u20AC euro sign escape"',
		explanation: 'Unicode escapes are valid in strings.',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'valid',
	},
	{
		json: '"\\n"',
		explanation: 'Escaped newline inside a string is valid.',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'valid',
	},
	{
		json: '"are unescaped newlines\n allowed?"',
		explanation: "Control characters like newlines aren't allowed in strings",
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'invalid',
	},
	{
		json: '"\\u000A unicode escaped newline"',
		explanation:
			"You're allowed to use Unicode escapes for newlines too! In fact, any character can be Unicode escaped",
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'valid',
	},

	{
		json: '" unescaped DEL character"',
		explanation:
			"The DEL character (`U+007F`) is not considered a control character in JSON, likely since it's uncommon today. It originally was used in punched tape systems and punched a hole in all 8 bits, causing the character to be skipped. Nowadays, DEL is sometimes used as a backspace equivalent in Unix-like operating systems",
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'valid',
	},
	{
		json: '"\u0000 NULL character"',
		explanation:
			'The NULL character (`U+0000`) is considered a control character and must be escaped',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'invalid',
	},
	{
		json: '"\\h\\i"',
		explanation:
			'`\\h` and `\\i` are invalid escapes. Valid special cased escapes are `\\"`, `\\\\`, `\\/`, `\\b`, `\\f`, `\\n`, `\\r`, `\\t`',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'invalid',
	},
	{
		json: '\\n[]',
		explanation: 'Escapes must be in a string',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'invalid',
	},
	{
		json: '"\\uFDD0 not a real character"',
		explanation: 'Unicode noncharacters may appear via escapes',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'valid',
	},
	{
		json: '"\\uaB0c"',
		explanation: 'Mixed case Unicode escapes are fine',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'valid',
	},
	{
		json: '"\\uaB0"',
		explanation: 'Unicode escapes must have 4 hex digits',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'invalid',
	},
	{
		json: '"\\U1234"',
		explanation:
			"The 'u' in a Unicode escape must be lowercase (i.e. '\\uXXXX')",
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'invalid',
	},
	{
		json: '"\\uZZZZ"',
		explanation: 'Non-hex digits are not allowed in Unicode escapes',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'invalid',
	},
	{
		json: '',
		explanation:
			"This wasn't a trick—there wasn't anything in the box! JSON requires at least one value. This isn't YAML!",
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259',
		answer: 'invalid',
	},
];
