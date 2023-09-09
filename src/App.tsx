import { invoke } from '@tauri-apps/api/tauri';
import { Show, createSignal } from 'solid-js';
import './App.css';
import CustomSlider from './components/CustomSlider';
import { urlToFile } from './helpers';
import ImagePanel from './components/ImagePanel';
import FileInputOnImage from './components/FileInputOnImage';
import Loader from './components/Loader';

function App() {
	const [imageFile, setImageFile] = createSignal<null | File>(null);
	const [convertedImage, setConvertedImage] = createSignal<null | string>(null);
	const [scaleFactor, setScaleFactor] = createSignal<number>(1);
	const [negative, setNegative] = createSignal(false);
	const [bitwise, setBitwise] = createSignal(false);
	const [bitwiseFactor, setBitwiseFactor] = createSignal<number>(2);
	const [isImageLoading, setIsImageLoading] = createSignal<boolean>(false);

	async function sendImage() {
		const reader = new FileReader();
		reader.onloadend = async function () {
			const base64String = reader.result as string;
			setIsImageLoading(true);
			const convertedBase64: string = await invoke('pixelizate', {
				base64Str: base64String,
				newDims: [scaleFactor(), scaleFactor()],
				format: base64String.substring(
					'data:image/'.length,
					base64String.indexOf(';base64'),
				),
				filters: [negative(), [bitwise(), bitwiseFactor()]],
			});
			setIsImageLoading(false);
			urlToFile(convertedBase64, 'converted.png', 'image/png').then((file) => {
				setConvertedImage(URL.createObjectURL(file));
			});
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

			<div class="settings">
				<button
					onClick={() => sendImage()}
					class={`convert-btn${!imageFile() ? ' disabled-btn' : ''}`}
					disabled={!imageFile()}
				>
					Convert an image
				</button>
				<div class="checkboxes">
					<div class="check-container">
						<input
							type="checkbox"
							id="negative-check"
							checked={negative()}
							onChange={() => setNegative(!negative())}
						/>
						<label for="negative-check" class="checkbox-label">
							Negative
						</label>
					</div>
					<div class="check-container">
						<input
							type="checkbox"
							id="bit-check"
							checked={bitwise()}
							onChange={() => setBitwise(!bitwise())}
						/>
						<label for="bit-check" class="checkbox-label">
							X-Bit
						</label>
					</div>
				</div>
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
			</div>

			<ImagePanel
				show={Boolean(convertedImage())}
				imageSrc={convertedImage()}
				tanned={isImageLoading()}
			>
				<Show when={isImageLoading()}>
					<Loader />
				</Show>
			</ImagePanel>
		</div>
	);
}

export default App;
