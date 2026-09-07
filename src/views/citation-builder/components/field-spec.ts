// Declarative shape for the two field kinds Field.astro can render, so a
// fieldset's fields can be a plain data array looped over in the markup
// instead of one hand-written <TextField>/<SelectField> per field.

type BaseFieldSpec = {
	id: string;
	name: string;
	label: string;
	hint?: string;
};

export type TextFieldSpec = BaseFieldSpec & {
	kind: 'text';
	inputmode?: 'numeric';
	pattern?: string;
};

export type SelectFieldSpec = BaseFieldSpec & {
	kind: 'select';
	options: { value: string; text: string }[];
};

export type FieldSpec = TextFieldSpec | SelectFieldSpec;
