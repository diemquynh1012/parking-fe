import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import axios from 'axios';
// Styles for the dialog content
const customStyles = {
    maxWidth: 400,
    margin: 'auto',
    borderRadius: 12,
    padding: 24,
};

const ReservationModal = ({
    isOpen,
    onClose,
    parkingLot,
    vehicles,
    onReservationSuccess,
    onAddVehicle,
}) => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [vehicleId, setVehicleId] = useState('');
    const [checkingSlot, setCheckingSlot] = useState(false);
    const [slotAvailable, setSlotAvailable] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setStartTime('');
            setEndTime('');
            setVehicleId('');
            setSlotAvailable(null);
            setError('');
            setSuccess(null);
            setSubmitting(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!startTime || !endTime || !parkingLot?.id) {
            setSlotAvailable(null);
            return;
        }
        let cancelled = false;
        setCheckingSlot(true);
        setError('');
        axios
            .get(`/api/parking-lots/${parkingLot.id}/available-slots`, {
                params: { startTime, endTime },
            })
            .then((res) => {
                if (!cancelled) {
                    setSlotAvailable(res.data.availableSlots > 0);
                }
            })
            .catch(() => {
                if (!cancelled) setError('Không kiểm tra được slot trống.');
            })
            .finally(() => {
                if (!cancelled) setCheckingSlot(false);
            });
        return () => {
            cancelled = true;
        };
    }, [startTime, endTime, parkingLot?.id]);

    const handleReserve = async () => {
        setError('');
        setSubmitting(true);
        try {
            const res = await axios.post('/api/reservations', {
                parkingLotId: parkingLot.id,
                vehicleId,
                startTime,
                endTime,
            });
            setSuccess({ qrCodeUrl: res.data.qrCodeUrl });
            setTimeout(() => {
                setSuccess(null);
                onClose();
                onReservationSuccess();
            }, 2000);
        } catch (e) {
            setError(e?.response?.data?.message || 'Đặt chỗ thất bại.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogContent style={customStyles}>
                <h2 style={{ marginBottom: 8 }}>Đặt chỗ trước</h2>
                <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 600 }}>{parkingLot?.name}</div>
                    <div style={{ fontSize: 14, color: '#555' }}>{parkingLot?.address}</div>
                    <div style={{ fontSize: 14, color: '#888' }}>
                        ⭐ {parkingLot?.rating} | Còn {parkingLot?.availableSlots} chỗ
                    </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>
                        Thời gian bắt đầu:
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={e => setStartTime(e.target.value)}
                            style={{ width: '100%', marginTop: 4 }}
                        />
                    </label>
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>
                        Thời gian kết thúc:
                        <input
                            type="datetime-local"
                            value={endTime}
                            onChange={e => setEndTime(e.target.value)}
                            style={{ width: '100%', marginTop: 4 }}
                        />
                    </label>
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>
                        Phương tiện:
                        {vehicles.length === 0 ? (
                            <div style={{ marginTop: 4 }}>
                                <button
                                    type="button"
                                    onClick={onAddVehicle}
                                    style={{
                                        background: '#007bff',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 4,
                                        padding: '6px 12px',
                                        cursor: 'pointer',
                                        marginTop: 4,
                                    }}
                                >
                                    Thêm phương tiện
                                </button>
                            </div>
                        ) : (
                            <select
                                value={vehicleId}
                                onChange={e => setVehicleId(e.target.value)}
                                style={{ width: '100%', marginTop: 4 }}
                            >
                                <option value="">-- Chọn phương tiện --</option>
                                {vehicles.map(v => (
                                    <option key={v.id} value={v.id}>
                                        {v.name} ({v.type})
                                    </option>
                                ))}
                            </select>
                        )}
                    </label>
                </div>
                {checkingSlot && <div style={{ color: '#888', marginBottom: 8 }}>Đang kiểm tra slot trống...</div>}
                {slotAvailable === false && (
                    <div style={{ color: 'red', marginBottom: 8 }}>Bãi đỗ đã full trong khung giờ này.</div>
                )}
                {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
                {success && (
                    <div style={{ color: 'green', marginBottom: 8 }}>
                        Đặt chỗ thành công!
                        <div style={{ marginTop: 8 }}>
                            <img src={success.qrCodeUrl} alt="QR Code" style={{ width: 120, height: 120 }} />
                        </div>
                    </div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            flex: 1,
                            background: '#eee',
                            border: 'none',
                            borderRadius: 4,
                            padding: '8px 0',
                            cursor: 'pointer',
                        }}
                        disabled={submitting}
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleReserve}
                        style={{
                            flex: 2,
                            background: '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            padding: '8px 0',
                            cursor: 'pointer',
                            opacity:
                                !startTime ||
                                !endTime ||
                                !vehicleId ||
                                slotAvailable === false ||
                                vehicles.length === 0 ||
                                submitting
                                    ? 0.6
                                    : 1,
                        }}
                        disabled={
                            !startTime ||
                            !endTime ||
                            !vehicleId ||
                            slotAvailable === false ||
                            vehicles.length === 0 ||
                            submitting
                        }
                    >
                        {submitting ? 'Đang đặt chỗ...' : 'Đặt chỗ'}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
export default ReservationModal;
