import { Accessor, Setter } from 'solid-js';

interface CustomCheckboxProps {
	name: string;
	value: Accessor<boolean>;
	setValue: Setter<boolean>;
}

function CustomCheckbox({ name, value, setValue }: CustomCheckboxProps) {
	return (
		<div class="check-container">
			<input
				type="checkbox"
				id={`${name.toLowerCase()}-check`}
				checked={value()}
				onChange={() => setValue(!value())}
			/>
			<label for={`${name.toLowerCase()}-check`} class="checkbox-label">
				{name}
			</label>
		</div>
	);
}

export default CustomCheckbox;
