import './ConvertButton.css';

interface ConvertButtonProps {
	onClick: () => Promise<void>;
	isDisabled: boolean;
}

function ConvertButton(props: ConvertButtonProps) {
	return (
		<button
			onClick={() => props.onClick()}
			class={`convert-btn${props.isDisabled ? ' disabled-btn' : ''}`}
			disabled={props.isDisabled}
		>
			Convert an image
		</button>
	);
}

export default ConvertButton;
