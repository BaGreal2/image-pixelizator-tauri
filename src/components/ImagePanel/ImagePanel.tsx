import { JSXElement, Show } from 'solid-js';
import './ImagePanel.css';

interface ImagePanelProps {
	show: boolean;
	imageSrc: string | null;
	tanned?: boolean;
	children?: JSXElement;
}

function ImagePanel(props: ImagePanelProps) {
	return (
		<div class="image-container">
			<Show when={props.show}>
				<img
					class={`file-image${props.tanned ? ' tanned-img' : ''}`}
					src={props.imageSrc!}
				/>
			</Show>
			{props.children}
		</div>
	);
}

export default ImagePanel;
