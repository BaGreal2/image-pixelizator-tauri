import { JSXElement } from 'solid-js';

interface SettingsProps {
	children: JSXElement;
}

function Settings(props: SettingsProps) {
	return <div class="settings">{props.children}</div>;
}

export default Settings;
