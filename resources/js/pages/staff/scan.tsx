import { useRef, useState } from 'react';
import { Head } from '@inertiajs/react';
import staff from '@/routes/staff';
import { QrScannerModal } from '@/components/qr-scanner-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClipboard } from '@/hooks/use-clipboard';
import { toast } from 'sonner';
import { Html5Qrcode } from 'html5-qrcode';
import {
    QrCode,
    Camera,
    Upload,
    Copy,
    Check,
    RotateCcw,
    Trash2,
    ScanLine,
    CheckCircle2,
    Clock,
    Sparkles,
    ImageIcon,
} from 'lucide-react';

interface ScannedItem {
    id: string;
    value: string;
    scannedAt: Date;
    source: 'camera' | 'image';
}

export default function Scan() {
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [modalInitialTab, setModalInitialTab] = useState<'camera' | 'upload'>('camera');
    const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
    const [lastScanned, setLastScanned] = useState<ScannedItem | null>(null);
    const [isProcessingDirectFile, setIsProcessingDirectFile] = useState(false);
    const [copiedText, copy] = useClipboard();
    const directFileInputRef = useRef<HTMLInputElement | null>(null);

    const handleScanSuccess = (decodedText: string, source: 'camera' | 'image' = 'camera') => {
        const newItem: ScannedItem = {
            id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
            value: decodedText,
            scannedAt: new Date(),
            source,
        };

        setLastScanned(newItem);
        setScannedItems((prev) => [newItem, ...prev]);
        toast.success(
            source === 'image'
                ? 'QR code decoded from image!'
                : 'QR code scanned successfully!'
        );
    };

    const handleDirectFileUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file.');
            return;
        }

        setIsProcessingDirectFile(true);
        const tempId = 'direct-file-qr-decoder';

        let tempEl = document.getElementById(tempId);
        if (!tempEl) {
            tempEl = document.createElement('div');
            tempEl.id = tempId;
            tempEl.style.display = 'none';
            document.body.appendChild(tempEl);
        }

        try {
            const scanner = new Html5Qrcode(tempId);
            const decodedText = await scanner.scanFile(file, false);
            try {
                scanner.clear();
            } catch {
                // ignore
            }
            handleScanSuccess(decodedText, 'image');
        } catch (err) {
            console.warn('Direct image QR decoding error:', err);
            toast.error('No QR code detected in this image. Try another file or use the camera.');
        } finally {
            setIsProcessingDirectFile(false);
            if (directFileInputRef.current) {
                directFileInputRef.current.value = '';
            }
        }
    };

    const handleCopy = async (text: string) => {
        const success = await copy(text);
        if (success) {
            toast.success('Copied value to clipboard');
        }
    };

    const handleClearCurrent = () => {
        setLastScanned(null);
    };

    const handleClearHistory = () => {
        setScannedItems([]);
        setLastScanned(null);
        toast.info('Scan history cleared');
    };

    const openModalWithTab = (tab: 'camera' | 'upload') => {
        setModalInitialTab(tab);
        setIsScannerOpen(true);
    };

    return (
        <>
            <Head title="Scanner" />

            {/* Hidden file input for direct header upload */}
            <input
                ref={directFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        handleDirectFileUpload(file);
                    }
                }}
            />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">
                {/* Header Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border rounded-xl bg-card text-card-foreground shadow-xs">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">QR Code Scanner</h1>
                            <Badge variant="secondary" className="gap-1 text-xs">
                                <Sparkles className="size-3" /> Camera & Image Test
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Test camera integration and QR code decoding from live video or image uploads.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            size="lg"
                            className="gap-2 cursor-pointer shadow-xs"
                            disabled={isProcessingDirectFile}
                            onClick={() => openModalWithTab('upload')}
                        >
                            <Upload className="size-4" />
                            <span>Upload Image</span>
                        </Button>

                        <Button
                            size="lg"
                            className="gap-2 cursor-pointer shadow-sm"
                            disabled={isProcessingDirectFile}
                            onClick={() => openModalWithTab('camera')}
                        >
                            <QrCode className="size-5" />
                            <span>Scan with Camera</span>
                        </Button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid gap-6">
                    {/* Latest Scanned Result */}
                    {lastScanned ? (
                        <Card className="border-primary/30 shadow-sm overflow-hidden animate-in fade-in-50 duration-300">
                            <CardHeader className="bg-primary/5 pb-4 border-b border-primary/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="size-5 text-emerald-500" />
                                        <CardTitle className="text-lg">Latest Scanned QR Value</CardTitle>
                                        <Badge
                                            variant="secondary"
                                            className="text-[10px] uppercase tracking-wider font-semibold capitalize"
                                        >
                                            {lastScanned.source === 'image' ? (
                                                <span className="flex items-center gap-1">
                                                    <ImageIcon className="size-3" /> Image File
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <Camera className="size-3" /> Camera
                                                </span>
                                            )}
                                        </Badge>
                                    </div>
                                    <Badge variant="outline" className="gap-1 text-xs font-normal">
                                        <Clock className="size-3" />
                                        {lastScanned.scannedAt.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                        })}
                                    </Badge>
                                </div>
                                <CardDescription className="text-xs">
                                    The QR code was decoded successfully.
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="pt-6 space-y-4">
                                <div className="p-4 rounded-lg bg-muted/60 border font-mono text-sm break-all select-all flex items-start justify-between gap-3">
                                    <span className="text-foreground leading-relaxed">
                                        {lastScanned.value}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCopy(lastScanned.value)}
                                            className="gap-1.5 cursor-pointer"
                                        >
                                            {copiedText === lastScanned.value ? (
                                                <>
                                                    <Check className="size-4 text-emerald-500" />
                                                    <span>Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="size-4" />
                                                    <span>Copy Value</span>
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClearCurrent}
                                            className="text-muted-foreground hover:text-foreground cursor-pointer"
                                        >
                                            Dismiss
                                        </Button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openModalWithTab('upload')}
                                            className="gap-1.5 cursor-pointer"
                                        >
                                            <Upload className="size-3.5" />
                                            Upload Another
                                        </Button>

                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => openModalWithTab('camera')}
                                            className="gap-1.5 cursor-pointer"
                                        >
                                            <RotateCcw className="size-3.5" />
                                            Scan Another
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        /* Empty State */
                        <Card className="border-dashed shadow-none">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <ScanLine className="size-8" />
                                </div>
                                <div className="space-y-1 max-w-sm">
                                    <h3 className="font-semibold text-lg">No QR code scanned yet</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Open the live camera or upload a QR code image to test decoding.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => openModalWithTab('upload')}
                                        className="gap-2 cursor-pointer"
                                    >
                                        <Upload className="size-4" />
                                        Upload Image File
                                    </Button>

                                    <Button
                                        onClick={() => openModalWithTab('camera')}
                                        className="gap-2 cursor-pointer"
                                    >
                                        <Camera className="size-4" />
                                        Launch Camera Scanner
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Scan History (if more than 0 items) */}
                    {scannedItems.length > 0 && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <CardTitle className="text-base">Scan Session History</CardTitle>
                                    <CardDescription className="text-xs">
                                        All QR codes scanned or uploaded during this session ({scannedItems.length})
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearHistory}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-8 gap-1 cursor-pointer"
                                >
                                    <Trash2 className="size-3.5" />
                                    Clear History
                                </Button>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <div className="divide-y rounded-md border">
                                    {scannedItems.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 text-sm hover:bg-muted/40 transition-colors"
                                        >
                                            <div className="flex items-start sm:items-center gap-3 min-w-0">
                                                <Badge variant="outline" className="text-[10px] shrink-0 font-mono">
                                                    #{scannedItems.length - index}
                                                </Badge>
                                                <div className="min-w-0">
                                                    <p className="font-mono text-xs truncate max-w-md text-foreground">
                                                        {item.value}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="size-3" />
                                                            {item.scannedAt.toLocaleTimeString()}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="capitalize flex items-center gap-1">
                                                            {item.source === 'image' ? (
                                                                <>
                                                                    <ImageIcon className="size-3" />
                                                                    Image
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Camera className="size-3" />
                                                                    Camera
                                                                </>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2 text-xs gap-1 cursor-pointer"
                                                    onClick={() => handleCopy(item.value)}
                                                >
                                                    {copiedText === item.value ? (
                                                        <>
                                                            <Check className="size-3 text-emerald-500" />
                                                            <span>Copied</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="size-3" />
                                                            <span>Copy</span>
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* QR Scanner Modal */}
            <QrScannerModal
                open={isScannerOpen}
                defaultTab={modalInitialTab}
                onOpenChange={setIsScannerOpen}
                onScan={handleScanSuccess}
            />
        </>
    );
}

Scan.layout = {
    breadcrumbs: [
        {
            title: 'Scanner',
            href: staff.scan().url,
        },
    ],
};
