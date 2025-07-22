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
  Divider
} from 'antd';
import {
  Edit2,
  Trash2,
  Plus,
  RefreshCw,
  Search
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
      const totalTasks = data.length;
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
      sortBy: sorter.field || 'createdAt',
      sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc'
    }));
  };

  const handleAssignTasks = async () => {
    try {
      const values = await assignForm.validateFields();
      const result = await assignTasksToUser({
        userId,
        taskCount: values.taskCount,
        totalProfit: values.totalProfit,
        forcedNumber: values.comboNumber,
        depositAmount: values.depositAmount,
        customProfit: values.customProfit
      });

      message.success(`Successfully assigned ${result.data.length} tasks`);
      setAssignModalVisible(false);
      assignForm.resetFields();
      fetchTasks();
    } catch (err) {
      message.error(err.message || 'Failed to assign tasks');
    }
  };

  const handleEditTask = async () => {
    try {
      const values = await editForm.validateFields();
      console.log(selectedTask.id);
      
      const updatedTask = await editTask(selectedTask.id, {
        ...values,
        // Only include these fields if it's a combo task
        ...(isComboTask && {
          depositAmount: values.depositAmount,
          customProfit: values.customProfit
        })
      });
      
      setTasks(prev => prev.map(task => 
        task._id === updatedTask._id ? updatedTask : task
      ));
      
      message.success('Task updated successfully');
      setEditModalVisible(false);
    } catch (err) {
      message.error(err.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      message.success('Task deleted successfully');
      fetchTasks();
    } catch (err) {
      message.error(err.message || 'Failed to delete task');
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
      render: status => <Tag color={statusColors[status]}>{status}</Tag>,
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
          {isForced ? 'Combo' : 'Normal'}
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
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<Edit2 size={16} />}
            onClick={() => handleEditClick(record)}
          />
          <Popconfirm
            title="Are you sure to delete this task?"
            onConfirm={() => handleDeleteTask(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<Trash2 size={16} />} danger />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
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
            <Statistic title="Total Profit" prefix="$" value={stats.totalProfit.toFixed(2)} />
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
            >
              Assign Tasks
            </Button>
            <Button
              icon={<RefreshCw size={16} />}
              onClick={fetchTasks}
            >
              Refresh
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <RangePicker
            showTime
            style={{ width: '100%', maxWidth: 400 }}
            onChange={(dates) => setFilters(prev => ({
              ...prev,
              dateRange: dates
            }))}
          />
          <Select
            style={{ width: 200, marginLeft: 8 }}
            placeholder="Filter by status"
            allowClear
            onChange={(value) => setFilters(prev => ({
              ...prev,
              status: value
            }))}
          >
            <Option value="pending">Pending</Option>
            <Option value="completed">Completed</Option>
            <Option value="failed">Failed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
          <Select
            style={{ width: 150, marginLeft: 8 }}
            placeholder="Filter by type"
            allowClear
            onChange={(value) => setFilters(prev => ({
              ...prev,
              isForced: value
            }))}
          >
            <Option value={true}>Combo</Option>
            <Option value={false}>Normal</Option>
          </Select>
          <Button
            type="primary"
            icon={<Search size={16} />}
            style={{ marginLeft: 8 }}
            onClick={fetchTasks}
          >
            Search
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="_id"
          loading={loading}
          pagination={pagination}
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
        }}
        confirmLoading={loading}
      >
        <Form form={assignForm} layout="vertical">
          <Form.Item
            name="taskCount"
            label="Number of Tasks"
            rules={[{ required: true, message: 'Please input the number of tasks' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="totalProfit"
            label="Total Profit"
            rules={[{ required: true, message: 'Please input the total profit' }]}
          >
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="comboNumber"
            label="Combo Task Number (optional)"
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="depositAmount"
            label="Deposit Amount (optional)"
          >
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="customProfit"
            label="Custom Profit (optional)"
          >
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        title={`Edit Task #${selectedTask?.taskNumber}`}
        visible={editModalVisible}
        onOk={handleEditTask}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
        }}
        confirmLoading={loading}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="status"
            label="Status"
          >
            <Select>
              <Option value="pending">Pending</Option>
              <Option value="completed">Completed</Option>
              <Option value="failed">Failed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="profitAmount"
            label="Profit Amount"
          >
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="makeCombo"
            label="Task Type"
          >
            <Select onChange={handleComboChange}>
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
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="customProfit"
                label="Custom Profit"
              >
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default UserTasks;