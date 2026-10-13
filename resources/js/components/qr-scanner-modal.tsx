import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import {
    Camera,
    Upload,
    ImageIcon,
    Sparkles,
    AlertTriangle,
    FileCheck,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface QrScannerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onScan: (decodedText: string, source?: 'camera' | 'image') => void;
    defaultTab?: 'camera' | 'upload';
}

interface CameraDevice {
    id: string;
    label: string;
}

function playBeepSound() {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    } catch {
        // Audio context may be restricted by browser policy
    }
}

function CameraScanner({
    onScan,
    onClose,
}: {
    onScan: (decodedText: string, source: 'camera') => void;
    onClose: () => void;
}) {
    const [cameras, setCameras] = useState<CameraDevice[]>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const elementId = 'unimart-qr-camera-stream';

    useEffect(() => {
        let isMounted = true;

        Html5Qrcode.getCameras()
            .then((devices) => {
                if (!isMounted) return;
                if (devices && devices.length > 0) {
                    setCameras(devices);
                    const backCamera = devices.find((d) =>
                        /back|rear|environment/i.test(d.label)
                    );
                    setSelectedCameraId(backCamera ? backCamera.id : devices[0].id);
                } else {
                    setSelectedCameraId('environment');
                }
            })
            .catch((err) => {
                if (!isMounted) return;
                console.warn('Unable to query camera list, falling back to facingMode:', err);
                setSelectedCameraId('environment');
            });

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!selectedCameraId) return;

        let isMounted = true;
        setIsLoading(true);
        setErrorMessage(null);

        const scanner = new Html5Qrcode(elementId);
        scannerRef.current = scanner;

        const cameraConfig =
            selectedCameraId === 'environment'
                ? { facingMode: 'environment' }
                : selectedCameraId;

        const config = {
            fps: 10,
            qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
                const minDimension = Math.min(viewfinderWidth, viewfinderHeight);
                const size = Math.floor(minDimension * 0.75);
                return { width: size, height: size };
            },
            aspectRatio: 1.0,
        };

        let isStopping = false;

        scanner
            .start(
                cameraConfig,
                config,
                (decodedText) => {
                    if (!isMounted || isStopping) return;
                    isStopping = true;

                    playBeepSound();
                    onScan(decodedText, 'camera');
                    onClose();
                },
                () => {
                    // Frame scan failed, normal during camera stream
                }
            )
            .then(() => {
                if (isMounted) {
                    setIsLoading(false);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setIsLoading(false);
                    console.error('QR Scanner start error:', err);
                    setErrorMessage(
                        err?.message ||
                            'Camera access denied or unavailable. Please ensure camera permissions are granted.'
                    );
                }
            });

        return () => {
            isMounted = false;
            if (scannerRef.current) {
                const current = scannerRef.current;
                const state = current.getState();
                if (
                    state === Html5QrcodeScannerState.SCANNING ||
                    state === Html5QrcodeScannerState.PAUSED
                ) {
                    current
                        .stop()
                        .then(() => {
                            try {
                                current.clear();
                            } catch {
                                // ignore
                            }
                        })
                        .catch((err) => {
                            console.warn('Error during scanner teardown:', err);
                        });
                } else {
                    try {
                        current.clear();
                    } catch {
                        // ignore
                    }
                }
            }
        };
    }, [selectedCameraId, onScan, onClose]);

    return (
        <div className="flex flex-col items-center gap-4">
            {cameras.length > 1 && (
                <div className="flex items-center justify-between w-full gap-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Camera className="size-3.5" /> Select Camera:
                    </span>
                    <Select
                        value={selectedCameraId}
                        onValueChange={(val) => setSelectedCameraId(val)}
                    >
                        <SelectTrigger className="h-8 text-xs w-[200px]">
                            <SelectValue placeholder="Choose camera" />
                        </SelectTrigger>
                        <SelectContent>
                            {cameras.map((cam, idx) => (
                                <SelectItem key={cam.id || idx} value={cam.id} className="text-xs">
                                    {cam.label || `Camera ${idx + 1}`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Camera Viewport */}
            <div className="relative w-full aspect-square max-w-[320px] rounded-xl overflow-hidden bg-black flex items-center justify-center border border-border shadow-inner">
                <div
                    id={elementId}
                    className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
                />

                {isLoading && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-xs gap-3">
                        <Spinner className="size-8 text-primary" />
                        <p className="text-xs font-medium text-muted-foreground animate-pulse">
                            Initializing camera...
                        </p>
                    </div>
                )}

                {/* Animated scan indicator overlay */}
                {!isLoading && !errorMessage && (
                    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center p-6">
                        <div className="relative w-44 h-44 sm:w-52 sm:h-52 border-2 border-dashed border-primary/60 rounded-xl flex items-center justify-center">
                            <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                            <div className="absolute -top-1 -left-1 size-4 border-t-2 border-l-2 border-primary rounded-tl" />
                            <div className="absolute -top-1 -right-1 size-4 border-t-2 border-r-2 border-primary rounded-tr" />
                            <div className="absolute -bottom-1 -left-1 size-4 border-b-2 border-l-2 border-primary rounded-bl" />
                            <div className="absolute -bottom-1 -right-1 size-4 border-b-2 border-r-2 border-primary rounded-br" />
                        </div>
                    </div>
                )}
            </div>

            {errorMessage && (
                <Alert variant="destructive" className="text-xs">
                    <AlertTriangle className="size-4" />
                    <AlertTitle className="text-xs font-semibold">Camera Error</AlertTitle>
                    <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
                </Alert>
            )}

            <p className="text-xs text-center text-muted-foreground">
                Point your camera at a QR code to scan it automatically.
            </p>
        </div>
    );
}

function ImageUploader({
    onScan,
    onClose,
}: {
    onScan: (decodedText: string, source: 'image') => void;
    onClose: () => void;
}) {
    const [isDecoding, setIsDecoding] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const tempElementId = 'unimart-qr-file-decoder-temp';

    const processFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setErrorMessage('Please upload a valid image file (.png, .jpg, .webp, etc.).');
            return;
        }

        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setIsDecoding(true);
        setErrorMessage(null);

        try {
            const scanner = new Html5Qrcode(tempElementId);
            const decodedText = await scanner.scanFile(file, false);
            try {
                scanner.clear();
            } catch {
                // ignore
            }

            playBeepSound();
            onScan(decodedText, 'image');
            onClose();
        } catch (err: any) {
            console.warn('QR file decoding failed:', err);
            setIsDecoding(false);
            setErrorMessage(
                'No QR code could be detected in this image. Please ensure the image is clear and contains a visible QR code.'
            );
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Hidden DOM element needed by html5-qrcode file scanner */}
            <div id={tempElementId} className="hidden" />

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-4/3 max-w-[340px] rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/60 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col items-center justify-center p-6 text-center cursor-pointer relative overflow-hidden"
            >
                {previewUrl ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center">
                        <img
                            src={previewUrl}
                            alt="Uploaded QR preview"
                            className="max-h-36 max-w-full object-contain rounded-lg shadow-xs"
                        />
                        {isDecoding && (
                            <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 rounded-lg">
                                <Spinner className="size-6 text-primary" />
                                <p className="text-xs font-medium text-primary">Decoding QR code...</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2.5">
                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Upload className="size-6" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Click or drag & drop image here</p>
                            <p className="text-xs text-muted-foreground">
                                PNG, JPG, WEBP, or screenshots containing a QR code
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {errorMessage && (
                <Alert variant="destructive" className="text-xs">
                    <AlertTriangle className="size-4" />
                    <AlertTitle className="text-xs font-semibold">Scanning Failed</AlertTitle>
                    <AlertDescription className="text-xs">{errorMessage}</AlertDescription>
                </Alert>
            )}

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isDecoding}
                className="gap-1.5 cursor-pointer text-xs"
            >
                <ImageIcon className="size-4" />
                Browse Image File
            </Button>
        </div>
    );
}

export function QrScannerModal({
    open,
    onOpenChange,
    onScan,
    defaultTab = 'camera',
}: QrScannerModalProps) {
    const [activeTab, setActiveTab] = useState<'camera' | 'upload'>(defaultTab);

    // Reset to default tab when modal opens
    useEffect(() => {
        if (open) {
            setActiveTab(defaultTab);
        }
    }, [open, defaultTab]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="size-5 text-primary" />
                        QR Code Scanner
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Scan using your live camera or upload an image file containing a QR code.
                    </DialogDescription>
                </DialogHeader>

                {/* Tab Switcher */}
                <div className="flex rounded-lg bg-muted p-1 gap-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab('camera')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                            activeTab === 'camera'
                                ? 'bg-background text-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Camera className="size-3.5" />
                        Live Camera
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('upload')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                            activeTab === 'upload'
                                ? 'bg-background text-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Upload className="size-3.5" />
                        Upload Image
                    </button>
                </div>

                {open && (
                    <div className="mt-2">
                        {activeTab === 'camera' ? (
                            <CameraScanner
                                onScan={onScan}
                                onClose={() => onOpenChange(false)}
                            />
                        ) : (
                            <ImageUploader
                                onScan={onScan}
                                onClose={() => onOpenChange(false)}
                            />
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
