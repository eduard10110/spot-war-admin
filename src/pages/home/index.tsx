import { Card, Typography } from "antd";
import { ExperimentOutlined, GlobalOutlined } from "@ant-design/icons";

const { Paragraph, Title } = Typography;

export default function Home() {
  return (
    <div className="max-w-3xl">
      <Title level={2} className="mt-0!">
        Dashboard
      </Title>
      <Paragraph type="secondary">
        Manage Spot War Firestore content: practice catalog (same collections as
        the mobile app) and online round assets with Storage uploads.
      </Paragraph>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="flex items-start gap-3">
            <ExperimentOutlined className="mt-1 text-xl text-violet-600" />
            <div>
              <Title level={5} className="mb-1!">
                Practice
              </Title>
              <Paragraph type="secondary" className="mb-0! text-sm">
                Edit practice levels, timers, and XP progression bands in{" "}
                <code className="rounded bg-slate-100 px-1">
                  practiceLevelsCatalog
                </code>{" "}
                and{" "}
                <code className="rounded bg-slate-100 px-1">
                  levelProgression
                </code>
                .
              </Paragraph>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-start gap-3">
            <GlobalOutlined className="mt-1 text-xl text-cyan-600" />
            <div>
              <Title level={5} className="mb-1!">
                Online
              </Title>
              <Paragraph type="secondary" className="mb-0! text-sm">
                Upload spot-the-difference images to Firebase Storage and
                configure rounds in{" "}
                <code className="rounded bg-slate-100 px-1">
                  onlineGameLevels
                </code>
                .
              </Paragraph>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
