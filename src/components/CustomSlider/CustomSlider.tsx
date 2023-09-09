import { Accessor, createSignal } from 'solid-js';

interface CustomSliderProps {
	min: number;
	max: number;
	onInput: (inputValue: number) => void;
	externalValue: Accessor<number>;
}

function CustomSlider({ min, max, onInput, externalValue }: CustomSliderProps) {
	const [value, setValue] = createSignal(min);
	return (
		<div class="range-container">
			<input
				id="custom-range"
				type="range"
				min={min}
				max={max}
				onInput={(e) => {
					setValue(Number(e.target.value));
					onInput(Number(e.target.value));
				}}
				value={value()}
				class="custom-range"
			/>
			<label for="custom-range" class="range-label">
				{externalValue()}
			</label>
		</div>
	);
}

export default CustomSlider;
