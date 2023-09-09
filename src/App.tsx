import { invoke } from '@tauri-apps/api/tauri';
import { Show, createSignal } from 'solid-js';
import './App.css';

function App() {
	const [imageFile, setImageFile] = createSignal<null | File>(null);
	const [convertedImage, setConvertedImage] = createSignal<null | string>(null);
	const [scaleFactor, setScaleFactor] = createSignal<number>(30);
	const [negative, setNegative] = createSignal(false);
	const [bitwise, setBitwise] = createSignal(false);
	const [bitwiseFactor, setBitwiseFactor] = createSignal<number>(4);

	// return a promise that resolves with a File instance
	async function urlToFile(url: string, filename: string, mimeType: string) {
		if (url.startsWith('data:')) {
			const arr = url.split(',');
			const mime = arr[0].match(/:(.*?);/)![1];
			const bstr = atob(arr[arr.length - 1]);
			let n = bstr.length;
			const u8arr = new Uint8Array(n);
			while (n--) {
				u8arr[n] = bstr.charCodeAt(n);
			}
			const file = new File([u8arr], filename, { type: mime || mimeType });
			return Promise.resolve(file);
		}
		const res = await fetch(url);
		const buf = await res.arrayBuffer();
		return new File([buf], filename, { type: mimeType });
	}

	async function sendImage() {
		const reader = new FileReader();
		reader.onloadend = async function () {
			const base64String = reader.result as string;
			const convertedBase64: string = await invoke('pixelizate', {
				base64Str: base64String,
				newDims: [scaleFactor(), scaleFactor()],
				format: base64String.substring(
					'data:image/'.length,
					base64String.indexOf(';base64'),
				),
				filters: [negative(), [bitwise(), bitwiseFactor()]],
			});
			urlToFile(convertedBase64, 'converted.png', 'image/png').then(
				function (file) {
					setConvertedImage(URL.createObjectURL(file));
				},
			);
		};
		reader.readAsDataURL(imageFile() as Blob);
	}

	return (
		<div class="container">
			<div class="image-container">
				<Show when={imageFile()}>
					<img class="file-image" src={URL.createObjectURL(imageFile()!)} />
				</Show>
				<input
					onChange={(e) => setImageFile(e.currentTarget.files![0])}
					type="file"
					accept="image/*"
					id="select-file"
					class="hidden"
				/>
				<label
					for="select-file"
					class={`image-label${imageFile() ? ' label-with-image' : ''}`}
				>
					Select an image
				</label>
			</div>

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
				<div class="range-container">
					<input
						id="scale-range"
						type="range"
						min={1}
						max={150}
						onInput={(e) => setScaleFactor(Number(e.target.value))}
						value={scaleFactor()}
						class="scale-range"
					/>
					<label for="scale-range" class="range-label">
						{scaleFactor()}
					</label>
				</div>
				<Show when={bitwise()}>
					<div class="range-container">
						<input
							id="bit-range"
							type="range"
							min={2}
							max={16}
							step={2}
							onInput={(e) => setBitwiseFactor(Number(e.target.value))}
							value={bitwiseFactor()}
							class="bitwise-range"
						/>
						<label for="bitwise-range" class="range-label">
							{bitwiseFactor()}
						</label>
					</div>
				</Show>
			</div>

			<div class="image-container">
				<Show when={convertedImage()}>
					<img class="file-image" src={convertedImage()!}></img>
				</Show>
			</div>
		</div>
	);
}

export default App;
