import { Accessor, For, Setter } from 'solid-js';
import CustomCheckbox from '../CustomCheckbox';
import './Checkboxes.css';

interface CheckboxesProps {
	items: {
		name: string;
		value: Accessor<boolean>;
		setValue: Setter<boolean>;
	}[];
}

function Checkboxes({ items }: CheckboxesProps) {
	return (
		<div class="checkboxes">
			<For each={items}>{(item) => <CustomCheckbox {...item} />}</For>
		</div>
	);
}

export default Checkboxes;
