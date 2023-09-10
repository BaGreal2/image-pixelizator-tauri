import { JSXElement } from 'solid-js';
import './Settings.css';

interface SettingsProps {
	children: JSXElement;
}

function Settings(props: SettingsProps) {
	return <div class="settings">{props.children}</div>;
}

export default Settings;
