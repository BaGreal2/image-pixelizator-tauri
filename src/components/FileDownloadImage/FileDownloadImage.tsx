import { save } from '@tauri-apps/api/dialog';
import { writeBinaryFile } from '@tauri-apps/api/fs';
import { downloadDir } from '@tauri-apps/api/path';
import './FileDownloadImage.css';

interface FileDownloadImageProps {
	imageSrc: string | null;
}

function FileDownloadImage(props: FileDownloadImageProps) {
	const saveImage = async (dataUrl: string) => {
		const suggestedFilename = 'image.png';

		// Save into the default downloads directory, like in the browser
		const filePath = (await save({
			defaultPath: (await downloadDir()) + '/' + suggestedFilename,
		})) as string;

		// Now we can write the file to the disk
		await writeBinaryFile(
			filePath,
			await fetch(dataUrl).then(async (res) =>
				(await res.blob()).arrayBuffer(),
			),
		);
	};
	return (
		<button
			onClick={() => saveImage(props.imageSrc!)}
			class={`download-image${props.imageSrc ? ' label-with-image' : ''}`}
		>
			Save image
		</button>
	);
}

export default FileDownloadImage;
