import { useState, useEffect, useCallback } from 'react';
import { Tabs, Table, Button, Modal, Form, Input, Select, InputNumber, Space, Popconfirm, Card, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SwapOutlined, SyncOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { 
    getAllQuyDoiNPL, createQuyDoiNPL, updateQuyDoiNPL, deleteQuyDoiNPL,
    getAllQuyDoiSP, createQuyDoiSP, updateQuyDoiSP, deleteQuyDoiSP 
} from '../../services/quydoidonvi.service';
import { getAllNguyenPhuLieu } from '../../services/nguyenphulieu.service';
import { getAllSanPham } from '../../services/sanpham.service';
import { getAllDonViTinhHQ } from '../../services/donvitinhHaiQuan.service';
import { showCreateSuccess, showUpdateSuccess, showDeleteSuccess, showLoadError, showSaveError, showDeleteError } from '../../components/notification';

const { Option } = Select;

const formatVNNumber = (value) => {
    if (value === null || value === undefined) return '';
    return Number(value).toLocaleString('vi-VN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};

// Component hiển thị danh sách ĐVT Hải quan (chỉ xem)
const DonViTinhHQTable = ({ dataSource, loading }) => {
    const columns = [
        { 
            title: 'Tên Đơn vị tính', 
            dataIndex: 'ten_dvt',
            width: '40%',
            render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
            sorter: (a, b) => a.ten_dvt?.localeCompare(b.ten_dvt),
        },
        { 
            title: 'Mô tả', 
            dataIndex: 'mo_ta',
            width: '60%',
            render: (text) => text || '—'
        },
    ];

    return (
        <Table 
            columns={columns} 
            dataSource={dataSource} 
            rowKey="id_dvt_hq"
            loading={loading}
            pagination={{ 
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (total) => `Tổng ${total} đơn vị tính`
            }}
            size="middle"
        />
    );
};

const QuyDoiTable = ({ type, dataSource, itemList, dvtHqList, loading, fetchData }) => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleAdd = useCallback(() => { 
        setEditingRecord(null); 
        form.resetFields(); 
        setIsModalVisible(true); 
    }, [form]);

    const handleEdit = useCallback((record) => { 
        setEditingRecord(record); 
        setTimeout(() => form.setFieldsValue(record), 0);
        setIsModalVisible(true); 
    }, [form]);

    const closeModal = useCallback(() => {
        setIsModalVisible(false);
        setTimeout(() => {
            setEditingRecord(null);
            form.resetFields();
        }, 300);
    }, [form]);
    
    const handleDelete = async (id_qd) => { 
        try {
            if (type === 'NPL') {
                await deleteQuyDoiNPL(id_qd);
            } else {
                await deleteQuyDoiSP(id_qd);
            }
            showDeleteSuccess('Quy đổi đơn vị');
            fetchData();
        } catch {
            showDeleteError('quy đổi đơn vị');
        }
    };

    const onFinish = async (values) => {
        try {
            setSubmitting(true);
            if (editingRecord) {
                if (type === 'NPL') {
                    await updateQuyDoiNPL(editingRecord.id_qd, values);
                } else {
                    await updateQuyDoiSP(editingRecord.id_qd, values);
                }
                showUpdateSuccess('Quy đổi đơn vị');
            } else {
                if (type === 'NPL') {
                    await createQuyDoiNPL(values);
                } else {
                    await createQuyDoiSP(values);
                }
                showCreateSuccess('Quy đổi đơn vị');
            }
            closeModal();
            fetchData();
        } catch {
            showSaveError('quy đổi đơn vị');
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        { 
            title: type === 'NPL' ? 'Nguyên phụ liệu' : 'Sản phẩm', 
            dataIndex: type === 'NPL' ? 'id_npl' : 'id_sp',
            width: '29%',
            render: (id, record) => {
                const name = type === 'NPL' 
                    ? (record.nguyenPhuLieu?.ten_npl || itemList.find(i => i.id_npl === id)?.ten_npl)
                    : (record.sanPham?.ten_sp || itemList.find(i => i.id_sp === id)?.ten_sp);
                return <span style={{ fontWeight: 500 }}>{name || '—'}</span>;
            }
        },
        { 
            title: 'ĐVT Doanh nghiệp', 
            dataIndex: type === 'NPL' ? 'ten_dvt_dn' : 'ten_dvt_sp',
            width: '18%',
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        { 
            title: 'ĐVT Hải quan', 
            dataIndex: 'id_dvt_hq',
            width: '18%',
            render: (id, record) => {
                const name = record.donViTinhHQ?.ten_dvt || dvtHqList.find(d => d.id_dvt_hq === id)?.ten_dvt;
                return <Tag color="green">{name || '—'}</Tag>;
            }
        },
        { 
            title: 'Hệ số', 
            dataIndex: 'he_so',
            width: '15%',
            align: 'right',
            render: (val) => <span style={{ fontWeight: 600, color: '#1890ff' }}>{formatVNNumber(val)}</span>
        },
        {
            title: 'Thao tác', 
            key: 'action',
            width: '20%',
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
                    <Popconfirm 
                        title="Xác nhận xóa"
                        description="Bạn có chắc muốn xóa quy đổi này?"
                        onConfirm={() => handleDelete(record.id_qd)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger icon={<DeleteOutlined />}>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <>
            <div style={{ marginBottom: 16 }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm quy đổi
                </Button>
            </div>
            
            <Table 
                columns={columns} 
                dataSource={dataSource} 
                rowKey="id_qd"
                loading={loading}
                pagination={{ 
                    pageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50'],
                    showTotal: (total) => `Tổng ${total} bản ghi`
                }}
                size="middle"
            />
            
            <Modal 
                title={
                    <Space>
                        <SwapOutlined />
                        <span>{editingRecord ? 'Chỉnh sửa quy đổi' : 'Thêm quy đổi mới'}</span>
                    </Space>
                }
                open={isModalVisible} 
                onCancel={closeModal} 
                footer={null}
                destroyOnClose
                maskClosable={false}
                width={500}
            >
                <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 16 }}>
                    <Form.Item 
                        name={type === 'NPL' ? 'id_npl' : 'id_sp'} 
                        label={type === 'NPL' ? 'Nguyên phụ liệu' : 'Sản phẩm'} 
                        rules={[{ required: true, message: 'Vui lòng chọn!' }]}
                    >
                        <Select 
                            placeholder={`Chọn ${type === 'NPL' ? 'nguyên phụ liệu' : 'sản phẩm'}`}
                            showSearch
                            optionFilterProp="children"
                        >
                            {itemList.map(i => (
                                <Option key={type === 'NPL' ? i.id_npl : i.id_sp} value={type === 'NPL' ? i.id_npl : i.id_sp}>
                                    {type === 'NPL' ? i.ten_npl : i.ten_sp}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    
                    <Form.Item 
                        name={type === 'NPL' ? 'ten_dvt_dn' : 'ten_dvt_sp'} 
                        label="Đơn vị tính Doanh nghiệp" 
                        rules={[{ required: true, message: 'Vui lòng nhập!' }]}
                    >
                        <Input placeholder="VD: Cây, Thùng, Bao, Hộp..." />
                    </Form.Item>
                    
                    <Form.Item 
                        name="id_dvt_hq" 
                        label="Đơn vị tính Hải quan" 
                        rules={[{ required: true, message: 'Vui lòng chọn!' }]}
                    >
                        <Select 
                            placeholder="Chọn ĐVT Hải quan"
                            showSearch
                            optionFilterProp="children"
                        >
                            {dvtHqList.map(d => (
                                <Option key={d.id_dvt_hq} value={d.id_dvt_hq}>{d.ten_dvt}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    
                    <Form.Item 
                        name="he_so" 
                        label="Hệ số quy đổi"
                        tooltip="1 ĐVT Doanh nghiệp = ? ĐVT Hải quan"
                        rules={[{ required: true, message: 'Vui lòng nhập!' }]}
                    >
                        <InputNumber 
                            min={0.000001} 
                            style={{ width: '100%' }} 
                            placeholder="VD: 100 (1 Cây = 100 Mét)"
                        />
                    </Form.Item>
                    
                    <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={closeModal}>Hủy</Button>
                            <Button type="primary" htmlType="submit" loading={submitting}>
                                {editingRecord ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

const QuyDoiDonVi = () => {
    const [dataNPL, setDataNPL] = useState([]);
    const [dataSP, setDataSP] = useState([]);
    const [nplList, setNplList] = useState([]);
    const [spList, setSpList] = useState([]);
    const [dvtHqList, setDvtHqList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('1');

    const fetchQuyDoiNPL = useCallback(async () => {
        try {
            const res = await getAllQuyDoiNPL();
            setDataNPL(Array.isArray(res) ? res : (res?.data || []));
        } catch {
            showLoadError('quy đổi NPL');
        }
    }, []);

    const fetchQuyDoiSP = useCallback(async () => {
        try {
            const res = await getAllQuyDoiSP();
            setDataSP(Array.isArray(res) ? res : (res?.data || []));
        } catch {
            showLoadError('quy đổi SP');
        }
    }, []);

    const fetchAllData = useCallback(async () => {
        try {
            setLoading(true);
            const [nplRes, spRes, dvtRes] = await Promise.all([
                getAllNguyenPhuLieu(),
                getAllSanPham(),
                getAllDonViTinhHQ()
            ]);
            
            setNplList(Array.isArray(nplRes) ? nplRes : (nplRes?.data || []));
            setSpList(Array.isArray(spRes) ? spRes : (spRes?.data || []));
            setDvtHqList(Array.isArray(dvtRes) ? dvtRes : (dvtRes?.data || []));
            
            await Promise.all([fetchQuyDoiNPL(), fetchQuyDoiSP()]);
        } catch {
            showLoadError('dữ liệu quy đổi đơn vị');
        } finally {
            setLoading(false);
        }
    }, [fetchQuyDoiNPL, fetchQuyDoiSP]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const tabItems = [
        {
            key: '1',
            label: (
                <span>
                    Nguyên phụ liệu
                    <Tag color="blue" style={{ marginLeft: 8 }}>{dataNPL.length}</Tag>
                </span>
            ),
            children: (
                <QuyDoiTable 
                    type="NPL" 
                    dataSource={dataNPL}
                    itemList={nplList}
                    dvtHqList={dvtHqList}
                    loading={loading}
                    fetchData={fetchQuyDoiNPL}
                />
            )
        },
        {
            key: '2',
            label: (
                <span>
                    Sản phẩm
                    <Tag color="green" style={{ marginLeft: 8 }}>{dataSP.length}</Tag>
                </span>
            ),
            children: (
                <QuyDoiTable 
                    type="SP" 
                    dataSource={dataSP}
                    itemList={spList}
                    dvtHqList={dvtHqList}
                    loading={loading}
                    fetchData={fetchQuyDoiSP}
                />
            )
        },
        {
            key: '3',
            label: (
                <span>
                    <UnorderedListOutlined style={{ marginRight: 6 }} />
                    ĐVT Hải quan
                    <Tag color="purple" style={{ marginLeft: 8 }}>{dvtHqList.length}</Tag>
                </span>
            ),
            children: (
                <DonViTinhHQTable 
                    dataSource={dvtHqList}
                    loading={loading}
                />
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 className="page-header-heading" style={{ margin: 0 }}>Quy đổi Đơn vị tính</h2>
                <Button icon={<SyncOutlined />} onClick={fetchAllData} loading={loading}>
                    Làm mới
                </Button>
            </div>
            
            <Card>
                <Tabs 
                    activeKey={activeTab} 
                    onChange={setActiveTab}
                    items={tabItems}
                />
            </Card>
        </div>
    );
};

export default QuyDoiDonVi;
