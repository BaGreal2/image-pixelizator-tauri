import './FileInputOnImage.css';

interface FileInputOnImageProps {
	onChange: (file: File) => void;
	imageFile: null | File;
}

function FileInputOnImage(props: FileInputOnImageProps) {
	return (
		<>
			<input
				onChange={(e) => props.onChange(e.currentTarget.files![0])}
				type="file"
				accept="image/*"
				id="select-file"
				class="hidden"
			/>
			<label
				for="select-file"
				class={`image-label${props.imageFile ? ' label-with-image' : ''}`}
			>
				Select an image
			</label>
		</>
	);
}

export default FileInputOnImage;
