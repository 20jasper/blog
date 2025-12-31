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
		explanation: 'whitespace is allowed between all json tokens',
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
		explanation: 'Arrays must be closed with a closing square brace',
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
			"literal names must be exactly `true`, `false`, or `null`. I'm sorry python devs",
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-3',
		answer: 'invalid',
	},
	{
		json: '10',
		explanation: 'scalars are still chill. 10 is a valid integer',
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
		explanation: 'Leading plus sign on integers is not good 😔',
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
		explanation: 'Decimal numbers with fractional part are valid',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-6',
		answer: 'valid',
	},
	{
		json: '0x10',
		explanation: 'Hexadecimal is not allowed in numbers',
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
			"Parsers are allowed to deny large numbers if they so choose. IEEE 754 float doubles are recommended for interop, but there's nothing stopping a parser from accepting arbitrarily high precision or only allowing very low precision. Does that mean that pretty much any syntactically valid number can be accepted or rejected? Ye",
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-6',
		answer: 'maybe valid',
	},
	{
		json: 'NaN',
		explanation:
			'NaN is not a valid JSON number literal. Despite recommending using the IEEE 754 float double range, not all values are allowed. Numbers without digits are not allowed',
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
			'U+2028 and U+2029 may appear in JSON strings. Fun fact, JavaScript does not allow these characters, so sorry to say, JSON is not a strict subset of JavaScript despite the goals of the format',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'valid',
	},
	{
		json: '[10,]',
		explanation:
			"Trailing commas aren't valid even if many parsers decide to accept them",
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-5',
		answer: 'invalid',
	},
	{
		json: '[[[[[[[[[[[[[[[[[[[[\n[[[[[[[[[[[[[[[[[[[[\n"this is balanced" ]]]]]]]]]]]]]]]]]]]]\n]]]]]]]]]]]]]]]]]]]]\n',
		explanation:
			'"An implementation may set limits on the size of texts that it accepts. An implementation may set limits on the maximum depth of nesting". Does this mean that pretty much any json is maybe valid? Ye. Am I going to change the rest of the quiz? Na',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259',
		answer: 'maybe valid',
	},
	{
		json: '{ "hi": null, "hi": null }',
		explanation:
			"YOu sure can have duplicate keys, but please don't unless you really like interoperability issues.",
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-4',
		answer: 'valid',
	},
	{
		json: '"pretend I\'m utf-8 encoded"',
		explanation: 'utf8 is the default encoding and very swell',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-8.1',
		answer: 'maybe valid',
	},
	{
		json: '"pretend I\'m utf-16 encoded"',
		explanation:
			"utf16 is allowed in internal systems that don't go over the network",
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-8.1',
		answer: 'maybe valid',
	},
	{
		json: '"pretend I\'m utf-32 encoded"',
		explanation:
			"utf32 is allowed in internal systems that don't go over the network",
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-8.1',
		answer: 'maybe valid',
	},
	{
		json: '"pretend I\'m utf-7 encoded"',
		explanation: 'utf 7 is not very swell',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-8.1',
		answer: 'invalid',
	},
	{
		json: '\ufeff"prefixed by byte order marker (BOM)"',
		explanation:
			'A leading byte order marker (BOM) is allowed in non network transmitted json and it can be ignored in network transmitted JSON',
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
		explanation: 'Escaped newline (\n) inside a string is valid.',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'valid',
	},
	{
		json: '"are unescaped newlines\n allowed?"',
		explanation: "control characters aren't allowed in strings",
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'invalid',
	},
	{
		json: '"\\u000A unicode escaped newline"',
		explanation: "You're allowed to uescape newlines too!",
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'valid',
	},
	{
		json: '" unescaped del character"',
		explanation:
			'del character is not considered a control character for some reason',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'valid',
	},
	{
		json: '"� null character"',
		explanation: 'null character must be escaped',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'invalid',
	},
	{
		json: '"\\h\\i"',
		explanation: '\\h and \\i are invalid escapes',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'invalid',
	},
	{
		json: '\\n[]',
		explanation: 'escapes must be in a string',
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
		explanation: 'mixed case unicode escapes are fine',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'valid',
	},
	{
		json: '"\\uaB0"',
		explanation: 'unicode escape must have 4 digits',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'invalid',
	},
	{
		json: '"\\U1234"',
		explanation: 'the u in a uescape must be lowercase',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'invalid',
	},
	{
		json: '"\\uZZZZ"',
		explanation: 'non hex digits are not allowed in uescapes',
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259#section-7',
		answer: 'invalid',
	},
	{
		json: '',
		explanation: "Nothing is invalid JSON. This isn't yaml!",
		citation: 'https://datatracker.ietf.org/doc/html/rfc8259',
		answer: 'invalid',
	},
];
