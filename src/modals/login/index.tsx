import { Button, Form, Input, Modal, Typography } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useState } from "react";

const { Text, Title } = Typography;

const HARDCODED_USERNAME = "admin";
const HARDCODED_PASSWORD = "adminSpot1War";

interface LoginFormValues {
  username: string;
  password: string;
}

interface LoginModalProps {
  onSuccess: () => void;
}

export default function LoginModal({ onSuccess }: LoginModalProps) {
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values: LoginFormValues) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    setLoading(false);

    if (
      values.username === HARDCODED_USERNAME &&
      values.password === HARDCODED_PASSWORD
    ) {
      onSuccess();
    } else {
      Modal.error({
        title: "Sign-in failed",
        content: "Invalid username or password.",
      });
    }
  };

  return (
    <Modal
      footer={null}
      title={null}
      closable={false}
      open
      centered
      width={400}
    >
      <div className="mb-6 flex flex-col items-center text-center">
        <Title level={3} className="mb-1!">
          Spot War Admin
        </Title>
        <Text type="secondary">Sign in to continue</Text>
      </div>
      <Form<LoginFormValues>
        layout="vertical"
        onFinish={handleFinish}
        className="mx-auto max-w-sm"
        requiredMark={false}
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Username required" }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Username"
            size="large"
          />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Password required" }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
            size="large"
          />
        </Form.Item>
        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            loading={loading}
          >
            Continue
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}
