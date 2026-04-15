import { useState } from 'react';
import { Alert, Button, Form, Input, Modal, Progress, Typography } from 'antd';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, firebaseConfigured } from '../modules/firebase';
import { syncAllToFirestore, type SyncProgress, type SyncResult } from '../modules/sync';

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
    return Promise.race([
        p,
        new Promise<T>((_, rej) =>
            setTimeout(() => rej(new Error(`${label}: timeout dopo ${ms / 1000}s`)), ms),
        ),
    ]);
}

const PHASE_LABEL: Record<SyncProgress['phase'], string> = {
    workshops: 'Officine',
    customers: 'Clienti',
    cars: 'Auto',
    estimates: 'Preventivi',
    default_items: 'Voci predefinite',
    done: 'Completato',
};

export default function SyncToWebPanel() {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loggedIn, setLoggedIn] = useState(false);
    const [uid, setUid] = useState<string | null>(null);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [loggingIn, setLoggingIn] = useState(false);
    const [progress, setProgress] = useState<SyncProgress | null>(null);
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState<SyncResult | null>(null);
    const [runError, setRunError] = useState<string | null>(null);

    function reset() {
        setOpen(false);
        setEmail('');
        setPassword('');
        setLoggedIn(false);
        setUid(null);
        setLoginError(null);
        setLoggingIn(false);
        setProgress(null);
        setRunning(false);
        setResult(null);
        setRunError(null);
    }

    async function handleLogin() {
        setLoginError(null);
        setLoggingIn(true);
        try {
            const cred = await withTimeout(
                signInWithEmailAndPassword(auth, email.trim(), password),
                20000,
                'Login',
            );
            setUid(cred.user.uid);
            setLoggedIn(true);
        } catch (err: any) {
            const code = err?.code ?? '';
            const msg =
                code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found'
                    ? 'Credenziali non valide.'
                    : code === 'auth/too-many-requests'
                        ? 'Troppi tentativi. Riprova più tardi.'
                        : code === 'auth/network-request-failed'
                            ? 'Errore di rete. Controlla la connessione.'
                            : `Errore: ${err?.message ?? err}`;
            setLoginError(msg);
        } finally {
            setLoggingIn(false);
        }
    }

    async function handleRun() {
        if (!uid) return;
        setRunning(true);
        setRunError(null);
        try {
            const res = await withTimeout(
                syncAllToFirestore(uid, setProgress),
                300000,
                'Sincronizzazione',
            );
            setResult(res);
        } catch (err: any) {
            setRunError(err?.message ?? String(err));
        } finally {
            setRunning(false);
        }
    }

    const phaseTotal = progress?.total ?? 0;
    const phasePct =
        progress?.phase === 'done'
            ? 100
            : phaseTotal > 0
                ? Math.round(((progress?.written ?? 0) / phaseTotal) * 100)
                : 0;

    return (
        <>
            <Typography.Paragraph style={{ marginTop: 0 }}>
                Carica tutti i dati locali (officine, clienti, auto, preventivi, voci predefinite) sull'account della versione web. Gli appuntamenti non vengono sincronizzati.
            </Typography.Paragraph>
            <Button type="primary" onClick={() => setOpen(true)} disabled={!firebaseConfigured}>
                Sincronizza con il web
            </Button>
            {!firebaseConfigured && (
                <Typography.Text type="warning" style={{ display: 'block', marginTop: 8 }}>
                    Firebase non configurato: manca <code>.env.local</code> con <code>VITE_FIREBASE_*</code>.
                </Typography.Text>
            )}

            <Modal
                title="Sincronizza con il web"
                open={open}
                onCancel={running ? undefined : reset}
                footer={null}
                centered
                width={480}
                maskClosable={!running}
            >
                {!loggedIn && (
                    <Form layout="vertical" onFinish={handleLogin}>
                        <Typography.Paragraph>
                            Accedi con le credenziali della versione web per caricare i dati sul tuo account.
                        </Typography.Paragraph>
                        <Form.Item label="Email" required>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus
                                disabled={loggingIn}
                            />
                        </Form.Item>
                        <Form.Item label="Password" required>
                            <Input.Password
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loggingIn}
                            />
                        </Form.Item>
                        {loginError && (
                            <Alert type="error" message={loginError} style={{ marginBottom: 12 }} />
                        )}
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loggingIn}
                            disabled={!email.trim() || !password}
                            block
                        >
                            Accedi
                        </Button>
                    </Form>
                )}

                {loggedIn && !result && (
                    <>
                        <Alert
                            type="info"
                            message={`Autenticato come ${auth.currentUser?.email ?? ''}`}
                            style={{ marginBottom: 12 }}
                        />
                        <Typography.Paragraph>
                            Verranno caricati tutti i dati locali. Se hai già dati sull'account web, i nuovi verranno aggiunti (non sostituiti).
                        </Typography.Paragraph>
                        {progress && (
                            <div style={{ marginBottom: 12 }}>
                                <Typography.Text type="secondary">
                                    {PHASE_LABEL[progress.phase]} — {progress.written} / {progress.total}
                                </Typography.Text>
                                <Progress percent={phasePct} />
                            </div>
                        )}
                        {runError && <Alert type="error" message={runError} style={{ marginBottom: 12 }} />}
                        <Button type="primary" onClick={handleRun} loading={running} block>
                            {running ? 'Sincronizzazione…' : 'Avvia sincronizzazione'}
                        </Button>
                    </>
                )}

                {result && (
                    <>
                        <Alert
                            type="success"
                            message="Sincronizzazione completata"
                            description={
                                <ul style={{ margin: 0, paddingLeft: 18 }}>
                                    <li>{result.counts.workshops} officine</li>
                                    <li>{result.counts.customers} clienti</li>
                                    <li>{result.counts.cars} auto</li>
                                    <li>{result.counts.estimates} preventivi</li>
                                    <li>{result.counts.default_items} voci predefinite</li>
                                </ul>
                            }
                            style={{ marginBottom: 12 }}
                        />
                        {result.warnings.length > 0 && (
                            <Alert
                                type="warning"
                                message={`Avvisi (${result.warnings.length})`}
                                description={
                                    <ul style={{ margin: 0, paddingLeft: 18, maxHeight: 160, overflow: 'auto' }}>
                                        {result.warnings.map((w, i) => (
                                            <li key={i}>{w}</li>
                                        ))}
                                    </ul>
                                }
                                style={{ marginBottom: 12 }}
                            />
                        )}
                        <Button type="primary" onClick={reset} block>
                            Chiudi
                        </Button>
                    </>
                )}
            </Modal>
        </>
    );
}
