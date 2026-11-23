import { useEffect, useState } from 'react';
import { disablePush, enablePush, getPushState, type PushState } from '../lib/push';

export default function PushToggle() {
    const [state, setState] = useState<PushState>('loading');
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        getPushState().then(setState);
    }, []);

    async function turnOn() {
        setBusy(true);
        setMessage(null);

        const result = await enablePush();

        if (result === 'enabled') {
            setState('on');
        } else if (result === 'denied') {
            setState('blocked');
        } else if (result === 'unsupported') {
            setState('unsupported');
        } else {
            setMessage('Something went wrong. Please try again.');
        }

        setBusy(false);
    }

    async function turnOff() {
        setBusy(true);
        setMessage(null);
        await disablePush();
        setState('off');
        setBusy(false);
    }

    if (state === 'loading') {
        return null;
    }

    return (
        <div className="olu-card">
            <h3>Notifications on this device</h3>

            {state === 'unsupported' && (
                <p>
                    This browser can't receive push notifications. On an iPhone, add the site to
                    your Home Screen first, then open it from there.
                </p>
            )}

            {state === 'blocked' && (
                <p>
                    Notifications are blocked for this site. Allow them in your browser's site
                    settings, then come back here.
                </p>
            )}

            {state === 'off' && (
                <>
                    <p>Get a little nudge on this device, even when the site is closed.</p>
                    <button className="olu-btn" type="button" onClick={turnOn} disabled={busy}>
                        {busy ? 'Turning on…' : 'Turn on notifications'}
                    </button>
                </>
            )}

            {state === 'on' && (
                <>
                    <p>Notifications are on for this device 💗</p>
                    <button className="olu-btn" type="button" onClick={turnOff} disabled={busy}>
                        {busy ? 'Turning off…' : 'Turn off on this device'}
                    </button>
                </>
            )}

            {message && <p role="alert">{message}</p>}
        </div>
    );
}