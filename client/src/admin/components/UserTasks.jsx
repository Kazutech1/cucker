import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  message,
  Card,
  Statistic,
  Row,
  Col,
  Tag,
  Space,
  Popconfirm,
  Divider,
  Spin
} from 'antd';
import {
  Edit2,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  Clock,
  Check,
  X
} from 'lucide-react';
import dayjs from 'dayjs';
import useTaskManagement from '../../../hooks/useAdminTasks';

const { Option } = Select;
const { RangePicker } = DatePicker;

const UserTasks = ({ userId }) => {
  const {
    loading,
    error,
    assignTasksToUser,
    editTask,
    getAllUsersTasks,
    deleteTask,
    updateTaskDetails
  } = useTaskManagement();

  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: undefined,
    isForced: undefined,
    dateRange: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalProfit: 0
  });
  const [isComboTask, setIsComboTask] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [forcedTasks, setForcedTasks] = useState([]);
  const [currentForcedTask, setCurrentForcedTask] = useState({
    taskNumber: undefined,
    depositAmount: undefined,
    customProfit: undefined
  });

  const [assignForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const statusColors = {
    pending: 'orange',
    completed: 'green',
    failed: 'red',
    cancelled: 'gray'
  };

  const fetchTasks = async () => {
    try {
      setActionLoading(true);
      const params = {
        userId,
        status: filters.status,
        isForced: filters.isForced,
        page: pagination.current,
        limit: pagination.pageSize,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.dateRange && {
          dateFrom: filters.dateRange[0].toISOString(),
          dateTo: filters.dateRange[1].toISOString()
        })
      };

      const { data, pagination: paginationData } = await getAllUsersTasks(params);
      setTasks(data);
      setPagination({
        ...pagination,
        total: paginationData.total
      });

      // Calculate stats
      const totalTasks = paginationData.total;
      const completedTasks = data.filter(task => task.status === 'completed').length;
      const pendingTasks = data.filter(task => task.status === 'pending').length;
      const totalProfit = data.reduce((sum, task) => sum + (task.profitAmount || 0), 0);

      setStats({
        totalTasks,
        completedTasks,
        pendingTasks,
        totalProfit
      });
    } catch (err) {
      message.error(err.message || 'Failed to fetch tasks');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
  }, [userId, pagination.current, filters]);

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination);
    setFilters(prev => ({
      ...prev,
      status: filters.status?.[0],
      isForced: filters.isForced?.[0],
      sortBy: sorter.field || 'createdAt',
      sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc'
    }));
  };

  const handleAssignTasks = async () => {
    try {
      setActionLoading(true);
      const values = await assignForm.validateFields();
      
      await assignTasksToUser({
        userId,
        taskCount: values.taskCount,
        totalProfit: values.totalProfit,
        forcedTasks: forcedTasks.length > 0 ? forcedTasks : undefined
      });

      message.success('Tasks assigned successfully!');
      setAssignModalVisible(false);
      assignForm.resetFields();
      setForcedTasks([]);
      await fetchTasks();
    } catch (err) {
      message.error(err.message || 'Failed to assign tasks');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditTask = async () => {
    try {
      setActionLoading(true);
      const values = await editForm.validateFields();
      
      await editTask(selectedTask.id, {
        ...values,
        ...(isComboTask && {
          depositAmount: values.depositAmount,
          customProfit: values.customProfit,
          makeForced: true
        })
      });
      
      message.success('Task updated successfully!');
      setEditModalVisible(false);
      await fetchTasks();
    } catch (err) {
      message.error(err.message || 'Failed to update task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setActionLoading(true);
      await deleteTask(taskId);
      message.success('Task deleted successfully!');
      await fetchTasks();
    } catch (err) {
      message.error(err.message || 'Failed to delete task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (record) => {
    setSelectedTask(record);
    setIsComboTask(record.isForced);
    editForm.setFieldsValue({
      status: record.status,
      profitAmount: record.profitAmount,
      makeCombo: record.isForced,
      ...(record.isForced && {
        depositAmount: record.depositAmount,
        customProfit: record.customProfit
      })
    });
    setEditModalVisible(true);
  };

  const handleComboChange = (value) => {
    setIsComboTask(value);
    if (!value) {
      editForm.setFieldsValue({
        depositAmount: undefined,
        customProfit: undefined
      });
    }
  };

  const resetFilters = () => {
    setFilters({
      status: undefined,
      isForced: undefined,
      dateRange: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setPagination({
      current: 1,
      pageSize: 20,
      total: 0
    });
  };

  const columns = [
    {
      title: 'Task #',
      dataIndex: 'taskNumber',
      key: 'taskNumber',
      sorter: true
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>,
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Completed', value: 'completed' },
        { text: 'Failed', value: 'failed' },
        { text: 'Cancelled', value: 'cancelled' }
      ]
    },
    {
      title: 'Type',
      dataIndex: 'isForced',
      key: 'isForced',
      render: isForced => (
        <Tag color={isForced ? 'volcano' : 'geekblue'}>
          {isForced ? 'COMBO' : 'NORMAL'}
        </Tag>
      ),
      filters: [
        { text: 'Combo', value: true },
        { text: 'Normal', value: false }
      ]
    },
    {
      title: 'Deposit Amount',
      dataIndex: 'depositAmount',
      key: 'depositAmount',
      render: amount => amount ? `$${amount.toFixed(2)}` : '-',
      sorter: true
    },
    {
      title: 'Profit',
      dataIndex: 'profitAmount',
      key: 'profitAmount',
      render: amount => amount ? `$${amount.toFixed(2)}` : '-',
      sorter: true
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => dayjs(date).format('YYYY-MM-DD HH:mm'),
      sorter: true
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          {record.status !== 'completed' && (
            <Button
              icon={<Edit2 size={16} />}
              onClick={() => handleEditClick(record)}
              disabled={actionLoading}
            />
          )}
          <Popconfirm
            title="Are you sure to delete this task?"
            onConfirm={() => handleDeleteTask(record._id)}
            okText="Yes"
            cancelText="No"
            disabled={actionLoading}
          >
            <Button 
              icon={<Trash2 size={16} />} 
              danger 
              disabled={actionLoading}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Spin spinning={loading && !actionLoading} tip="Loading...">
      <div>
        <Card>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic title="Total Tasks" value={stats.totalTasks} />
            </Col>
            <Col span={6}>
              <Statistic title="Completed Tasks" value={stats.completedTasks} />
            </Col>
            <Col span={6}>
              <Statistic title="Pending Tasks" value={stats.pendingTasks} />
            </Col>
            <Col span={6}>
              <Statistic 
                title="Total Profit" 
                prefix="$" 
                value={stats.totalProfit.toFixed(2)} 
                valueStyle={{ color: '#3f8600' }}
              />
            </Col>
          </Row>
        </Card>

        <Divider />

        <Card
          title="Tasks Management"
          extra={
            <Space>
              <Button
                type="primary"
                icon={<Plus size={16} />}
                onClick={() => setAssignModalVisible(true)}
                loading={actionLoading}
              >
                Assign Tasks
              </Button>
              <Button
                icon={<RefreshCw size={16} />}
                onClick={fetchTasks}
                loading={actionLoading}
              >
                Refresh
              </Button>
              <Button
                onClick={resetFilters}
                disabled={actionLoading}
              >
                Reset Filters
              </Button>
            </Space>
          }
        >
          <div style={{ marginBottom: 16 }}>
            <Space>
              <RangePicker
                showTime
                style={{ width: '100%', maxWidth: 400 }}
                onChange={(dates) => setFilters(prev => ({
                  ...prev,
                  dateRange: dates
                }))}
                disabled={actionLoading}
              />
              <Select
                style={{ width: 200 }}
                placeholder="Filter by status"
                allowClear
                value={filters.status}
                onChange={(value) => setFilters(prev => ({
                  ...prev,
                  status: value
                }))}
                disabled={actionLoading}
              >
                <Option value="pending">Pending</Option>
                <Option value="completed">Completed</Option>
                <Option value="failed">Failed</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
              <Select
                style={{ width: 150 }}
                placeholder="Filter by type"
                allowClear
                value={filters.isForced}
                onChange={(value) => setFilters(prev => ({
                  ...prev,
                  isForced: value
                }))}
                disabled={actionLoading}
              >
                <Option value={true}>Combo</Option>
                <Option value={false}>Normal</Option>
              </Select>
              <Button
                type="primary"
                icon={<Search size={16} />}
                onClick={fetchTasks}
                loading={actionLoading}
              >
                Search
              </Button>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={tasks}
            rowKey="_id"
            loading={actionLoading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Total ${total} tasks`
            }}
            onChange={handleTableChange}
            scroll={{ x: true }}
          />
        </Card>

        {/* Assign Tasks Modal */}
        <Modal
          title="Assign New Tasks"
          visible={assignModalVisible}
          onOk={handleAssignTasks}
          onCancel={() => {
            setAssignModalVisible(false);
            assignForm.resetFields();
            setForcedTasks([]);
            setCurrentForcedTask({
              taskNumber: undefined,
              depositAmount: undefined,
              customProfit: undefined
            });
          }}
          confirmLoading={actionLoading}
          destroyOnClose
          width={800}
        >
          <Form form={assignForm} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="taskCount"
                  label="Number of Tasks"
                  rules={[{ required: true, message: 'Please input the number of tasks' }]}
                >
                  <InputNumber min={1} style={{ width: '100%' }} disabled={actionLoading} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="totalProfit"
                  label="Total Profit"
                  rules={[{ required: true, message: 'Please input the total profit' }]}
                >
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} disabled={actionLoading} />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Combo Tasks (Optional)</Divider>
            
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Task Number">
                  <InputNumber 
                    min={1} 
                    style={{ width: '100%' }} 
                    value={currentForcedTask.taskNumber}
                    onChange={(value) => setCurrentForcedTask(prev => ({
                      ...prev,
                      taskNumber: value
                    }))}
                    disabled={actionLoading}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Deposit Amount">
                  <InputNumber 
                    min={0} 
                    step={0.01} 
                    style={{ width: '100%' }} 
                    value={currentForcedTask.depositAmount}
                    onChange={(value) => setCurrentForcedTask(prev => ({
                      ...prev,
                      depositAmount: value
                    }))}
                    disabled={actionLoading}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Custom Profit">
                  <InputNumber 
                    min={0} 
                    step={0.01} 
                    style={{ width: '100%' }} 
                    value={currentForcedTask.customProfit}
                    onChange={(value) => setCurrentForcedTask(prev => ({
                      ...prev,
                      customProfit: value
                    }))}
                    disabled={actionLoading}
                  />
                </Form.Item>
              </Col>
            </Row>

            <div style={{ marginBottom: 16, textAlign: 'right' }}>
              <Button
                type="dashed"
                icon={<Plus />}
                onClick={() => {
                  if (currentForcedTask.taskNumber && 
                      currentForcedTask.depositAmount !== undefined && 
                      currentForcedTask.customProfit !== undefined) {
                    setForcedTasks([...forcedTasks, currentForcedTask]);
                    setCurrentForcedTask({
                      taskNumber: undefined,
                      depositAmount: undefined,
                      customProfit: undefined
                    });
                  } else {
                    message.warning('Please fill all fields for the Combo task');
                  }
                }}
                disabled={actionLoading}
              >
                Add Combo Task
              </Button>
            </div>

            {forcedTasks.length > 0 && (
              <Table
                dataSource={forcedTasks}
                rowKey={(record) => record.taskNumber}
                pagination={false}
                size="small"
                columns={[
                  {
                    title: 'Task #',
                    dataIndex: 'taskNumber',
                    key: 'taskNumber'
                  },
                  {
                    title: 'Deposit Amount',
                    dataIndex: 'depositAmount',
                    key: 'depositAmount',
                    render: (value) => `$${value?.toFixed(2)}`
                  },
                  {
                    title: 'Custom Profit',
                    dataIndex: 'customProfit',
                    key: 'customProfit',
                    render: (value) => `$${value?.toFixed(2)}`
                  },
                  {
                    title: 'Action',
                    key: 'action',
                    render: (_, record) => (
                      <Button
                        danger
                        size="small"
                        icon={<Trash2 size={14} />}
                        onClick={() => {
                          setForcedTasks(forcedTasks.filter(task => task.taskNumber !== record.taskNumber));
                        }}
                        disabled={actionLoading}
                      />
                    )
                  }
                ]}
              />
            )}
          </Form>
        </Modal>

        {/* Edit Task Modal */}
      {/* Edit Task Modal */}
        <Modal
          title={`Edit Task #${selectedTask?.taskNumber}`}
          visible={editModalVisible}
          onOk={handleEditTask}
          onCancel={() => {
            setEditModalVisible(false);
            editForm.resetFields();
          }}
          confirmLoading={actionLoading}
          destroyOnClose
        >
          <Form form={editForm} layout="vertical">
            {/* Status Selection Buttons */}
            <Form.Item
              name="status"
              label="Status"
              style={{ marginBottom: 24 }}
            >
              <Button.Group style={{ width: '100%' }}>
                <Button
                  style={{ width: '33.33%' }}
                  onClick={() => editForm.setFieldsValue({ status: 'pending' })}
                  type={editForm.getFieldValue('status') === 'pending' ? 'primary' : 'default'}
                  icon={<Clock size={16} />}
                >
                  Pending
                </Button>
                <Button
                  style={{ width: '33.33%' }}
                  onClick={() => editForm.setFieldValue({ status: 'completed' })}
                  type={editForm.getFieldValue('status') === 'completed' ? 'primary' : 'default'}
                  icon={<Check size={16} />}
                >
                  Completed
                </Button>
                <Button
                  style={{ width: '33.33%' }}
                  onClick={() => editForm.setFieldValue({ status: 'failed' })}
                  type={editForm.getFieldValue('status') === 'failed' ? 'primary' : 'default'}
                  icon={<X size={16} />}
                  danger
                >
                  Rejected
                </Button>
              </Button.Group>
            </Form.Item>

            <Form.Item
              name="profitAmount"
              label="Profit Amount"
            >
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} disabled={actionLoading} />
            </Form.Item>
            <Form.Item
              name="makeCombo"
              label="Task Type"
            >
              <Select onChange={handleComboChange} disabled={actionLoading}>
                <Option value={false}>Normal</Option>
                <Option value={true}>Combo</Option>
              </Select>
            </Form.Item>
            {isComboTask && (
              <>
                <Form.Item
                  name="depositAmount"
                  label="Deposit Amount"
                >
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} disabled={actionLoading} />
                </Form.Item>
                <Form.Item
                  name="customProfit"
                  label="Custom Profit"
                >
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} disabled={actionLoading} />
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>
      </div>
    </Spin>
  );
};

export default UserTasks;