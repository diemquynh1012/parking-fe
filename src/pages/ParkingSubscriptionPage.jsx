import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Vehicle type options
const VEHICLE_TYPES = [
    { value: 'motorbike', label: 'Xe máy' },
    { value: 'car', label: 'Ô tô' },
    { value: 'bicycle', label: 'Xe đạp' },
    { value: 'electric', label: 'Xe điện' },
];

// Helper: Vehicle type label
const getVehicleTypeLabel = (type) => {
    const found = VEHICLE_TYPES.find((v) => v.value === type);
    return found ? found.label : type;
};

// Notification component
function Notification({ message, type, onClose }) {
    if (!message) return null;
    return (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg text-white ${type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
            <div className="flex items-center">
                <span>{message}</span>
                <button className="ml-4" onClick={onClose}>×</button>
            </div>
        </div>
    );
}

// Loading spinner
function Spinner() {
    return (
        <div className="flex justify-center items-center py-4">
            <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}

// Add/Edit Vehicle Form
function VehicleForm({ initial, onSubmit, onCancel, loading }) {
    const [licensePlate, setLicensePlate] = useState(initial.licensePlate || '');
    const [vehicleType, setVehicleType] = useState(initial.vehicleType || '');
    const [description, setDescription] = useState(initial.description || '');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!licensePlate.trim()) {
            setError('Biển số là bắt buộc');
            return;
        }
        if (!vehicleType) {
            setError('Vui lòng chọn loại xe');
            return;
        }
        setError('');
        onSubmit({ licensePlate: licensePlate.trim(), vehicleType, description: description.trim() });
    };

    return (
        <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
                <label className="block font-medium">Biển số <span className="text-red-500">*</span></label>
                <input
                    className="w-full border rounded px-3 py-2"
                    value={licensePlate}
                    onChange={e => setLicensePlate(e.target.value)}
                    disabled={!!initial.id}
                />
            </div>
            <div>
                <label className="block font-medium">Loại xe <span className="text-red-500">*</span></label>
                <select
                    className="w-full border rounded px-3 py-2"
                    value={vehicleType}
                    onChange={e => setVehicleType(e.target.value)}
                >
                    <option value="">-- Chọn loại xe --</option>
                    {VEHICLE_TYPES.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block font-medium">Mô tả</label>
                <input
                    className="w-full border rounded px-3 py-2"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
                    {loading ? 'Đang lưu...' : (initial.id ? 'Lưu' : 'Thêm')}
                </button>
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={onCancel} disabled={loading}>
                    Hủy
                </button>
            </div>
        </form>
    );
}

// Main Vehicle Management Component
function VehicleManagement() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editVehicle, setEditVehicle] = useState(null);
    const [apiLoading, setApiLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [deleteId, setDeleteId] = useState(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const PAGE_SIZE = 10;

    // Fetch vehicles
    useEffect(() => {
        let ignore = false;
        setLoading(true);
        axios.get(`/api/vehicles?page=${page}&limit=${PAGE_SIZE}`)
            .then(res => {
                if (!ignore) {
                    setVehicles(res.data.vehicles || []);
                    setTotal(res.data.total || 0);
                }
            })
            .catch(() => {
                if (!ignore) setNotification({ message: 'Lỗi tải danh sách phương tiện', type: 'error' });
            })
            .finally(() => { if (!ignore) setLoading(false); });
        return () => { ignore = true; };
    }, [page]);

    // Add vehicle
    const handleAdd = () => {
        setEditVehicle(null);
        setFormOpen(true);
    };

    const handleFormSubmit = async (data) => {
        setApiLoading(true);
        if (editVehicle) {
            // Edit
            try {
                await axios.put(`/api/vehicles/${editVehicle.id}`, data);
                setNotification({ message: 'Cập nhật phương tiện thành công', type: 'success' });
                setFormOpen(false);
                setEditVehicle(null);
                // Refresh
                setLoading(true);
                const res = await axios.get(`/api/vehicles?page=${page}&limit=${PAGE_SIZE}`);
                setVehicles(res.data.vehicles || []);
                setTotal(res.data.total || 0);
            } catch (err) {
                setNotification({ message: err?.response?.data?.message || 'Lỗi cập nhật phương tiện', type: 'error' });
            } finally {
                setApiLoading(false);
            }
        } else {
            // Add
            try {
                await axios.post('/api/vehicles', data);
                setNotification({ message: 'Thêm phương tiện thành công', type: 'success' });
                setFormOpen(false);
                // Refresh
                setLoading(true);
                const res = await axios.get(`/api/vehicles?page=${page}&limit=${PAGE_SIZE}`);
                setVehicles(res.data.vehicles || []);
                setTotal(res.data.total || 0);
            } catch (err) {
                if (err?.response?.status === 409) {
                    setNotification({ message: 'Biển số đã tồn tại', type: 'error' });
                } else {
                    setNotification({ message: err?.response?.data?.message || 'Lỗi thêm phương tiện', type: 'error' });
                }
            } finally {
                setApiLoading(false);
            }
        }
    };

    // Edit
    const handleEdit = (vehicle) => {
        setEditVehicle(vehicle);
        setFormOpen(true);
    };

    // Delete
    const handleDelete = async (id) => {
        setApiLoading(true);
        try {
            await axios.delete(`/api/vehicles/${id}`);
            setNotification({ message: 'Xóa phương tiện thành công', type: 'success' });
            // Refresh
            setLoading(true);
            const res = await axios.get(`/api/vehicles?page=${page}&limit=${PAGE_SIZE}`);
            setVehicles(res.data.vehicles || []);
            setTotal(res.data.total || 0);
        } catch (err) {
            setNotification({ message: err?.response?.data?.message || 'Lỗi xóa phương tiện', type: 'error' });
        } finally {
            setApiLoading(false);
            setDeleteId(null);
        }
    };

    // Pagination
    const totalPages = Math.ceil(total / PAGE_SIZE);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-3xl mx-auto py-8 px-4">
                <h1 className="text-2xl font-bold mb-2">Đăng ký & Quản lý phương tiện</h1>
                <p className="mb-4 text-gray-600">Quản lý các phương tiện đã đăng ký của bạn.</p>
                <div className="mb-4">
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        onClick={handleAdd}
                        disabled={formOpen || apiLoading}
                    >
                        + Thêm phương tiện
                    </button>
                </div>
                {formOpen && (
                    <div className="bg-white p-4 rounded shadow mb-4">
                        <VehicleForm
                            initial={editVehicle || {}}
                            onSubmit={handleFormSubmit}
                            onCancel={() => { setFormOpen(false); setEditVehicle(null); }}
                            loading={apiLoading}
                        />
                    </div>
                )}
                {loading ? (
                    <Spinner />
                ) : (
                    <div className="bg-white rounded shadow">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-3 py-2 text-left">Biển số</th>
                                    <th className="px-3 py-2 text-left">Loại xe</th>
                                    <th className="px-3 py-2 text-left">Mô tả</th>
                                    <th className="px-3 py-2 text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicles.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-6 text-gray-400">Chưa có phương tiện nào</td>
                                    </tr>
                                ) : (
                                    vehicles.map(vehicle => (
                                        <tr key={vehicle.id} className="border-t">
                                            <td className="px-3 py-2">{vehicle.licensePlate}</td>
                                            <td className="px-3 py-2">{getVehicleTypeLabel(vehicle.vehicleType)}</td>
                                            <td className="px-3 py-2">{vehicle.description || '-'}</td>
                                            <td className="px-3 py-2 text-center">
                                                <button
                                                    className="text-blue-600 hover:underline mr-2"
                                                    onClick={() => handleEdit(vehicle)}
                                                    disabled={apiLoading}
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    className="text-red-600 hover:underline"
                                                    onClick={() => setDeleteId(vehicle.id)}
                                                    disabled={apiLoading}
                                                >
                                                    Xóa
                                                </button>
                                                {/* Delete confirm dialog */}
                                                {deleteId === vehicle.id && (
                                                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                                                        <div className="bg-white p-6 rounded shadow-lg">
                                                            <div className="mb-4">Bạn chắc chắn muốn xóa phương tiện này?</div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    className="bg-red-600 text-white px-4 py-2 rounded"
                                                                    onClick={() => handleDelete(vehicle.id)}
                                                                    disabled={apiLoading}
                                                                >
                                                                    {apiLoading ? 'Đang xóa...' : 'Xóa'}
                                                                </button>
                                                                <button
                                                                    className="bg-gray-300 px-4 py-2 rounded"
                                                                    onClick={() => setDeleteId(null)}
                                                                    disabled={apiLoading}
                                                                >
                                                                    Hủy
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 py-4">
                                <button
                                    className="px-3 py-1 rounded bg-gray-200"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >Trước</button>
                                <span>Trang {page} / {totalPages}</span>
                                <button
                                    className="px-3 py-1 rounded bg-gray-200"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >Sau</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <Notification
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ message: '', type: '' })}
            />
            <Footer />
        </div>
    );
}

export default VehicleManagement;
