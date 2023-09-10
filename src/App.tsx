import { invoke } from '@tauri-apps/api/tauri';
import { Show, createSignal } from 'solid-js';
import './App.css';
import CustomSlider from './components/CustomSlider';
import { urlToFile } from './helpers';
import ImagePanel from './components/ImagePanel';
import FileInputOnImage from './components/FileInputOnImage';
import Loader from './components/Loader';
import Settings from './components/Settings';
import ConvertButton from './components/ConvertButton';
import Checkboxes from './components/Checkboxes';
import FileDownloadImage from './components/FileDownloadImage';

function App() {
	const [imageFile, setImageFile] = createSignal<null | File>(null);
	const [convertedImage, setConvertedImage] = createSignal<null | string>(null);
	const [scaleFactor, setScaleFactor] = createSignal<number>(1);
	const [grayscale, setGrayscale] = createSignal(false);
	const [negative, setNegative] = createSignal(false);
	const [bitwise, setBitwise] = createSignal(false);
	const [bitwiseFactor, setBitwiseFactor] = createSignal<number>(2);
	const [isImageLoading, setIsImageLoading] = createSignal<boolean>(false);

	async function sendImage() {
		const reader = new FileReader();
		reader.onloadend = async function () {
			const base64String = reader.result as string;
			const fileType = base64String.substring(
				'data:image/'.length,
				base64String.indexOf(';base64'),
			);
			setIsImageLoading(true);

			const convertedBase64: string = await invoke('pixelizate', {
				base64Str: base64String,
				newDims: [scaleFactor(), scaleFactor()],
				format: fileType,
				filters: [negative(), [bitwise(), bitwiseFactor()], grayscale()],
			});

			setIsImageLoading(false);
			const convertedFile = await urlToFile(
				convertedBase64,
				`converted.${fileType}`,
				`image/${fileType}`,
			);
			setConvertedImage(URL.createObjectURL(convertedFile));
		};
		reader.readAsDataURL(imageFile() as Blob);
	}

	return (
		<div class="container">
			<ImagePanel
				show={Boolean(imageFile())}
				imageSrc={imageFile() ? URL.createObjectURL(imageFile()!) : null}
			>
				<FileInputOnImage
					onChange={(file: File) => setImageFile(file)}
					imageFile={imageFile()}
				/>
			</ImagePanel>

			<Settings>
				<ConvertButton onClick={sendImage} isDisabled={!imageFile()} />
				<Checkboxes
					items={[
						{ name: 'Negative', value: negative, setValue: setNegative },
						{
							name: 'X-bit',
							value: bitwise,
							setValue: setBitwise,
						},
						{
							name: 'Grayscale',
							value: grayscale,
							setValue: setGrayscale,
						},
					]}
				/>
				<CustomSlider
					min={1}
					max={150}
					onInput={(inputValue) => setScaleFactor(inputValue)}
					externalValue={scaleFactor}
				/>
				<Show when={bitwise()}>
					<CustomSlider
						min={1}
						max={4}
						onInput={(inputValue) => setBitwiseFactor(2 ** inputValue)}
						externalValue={bitwiseFactor}
					/>
				</Show>
			</Settings>

			<ImagePanel
				show={Boolean(convertedImage())}
				imageSrc={convertedImage()}
				tanned={isImageLoading()}
			>
				<Show when={isImageLoading()}>
					<Loader />
				</Show>
				<FileDownloadImage imageSrc={convertedImage()} />
			</ImagePanel>
		</div>
	);
}

export default App;
