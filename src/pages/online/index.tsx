import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import Loader from "@components/loader";
import OnlineGameController from "@controllers/onlineGame";
import type { OnlineLevelModalState } from "@helpers/types/admin";
import type { OnlineGameLevel } from "@helpers/types/backend";
import OnlineLevelModal from "@modals/OnlineLevelModal";
import { Button, Space, Switch, Table, Tag, Typography } from "antd";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const { Title, Paragraph } = Typography;

export default function Online() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<OnlineGameLevel[]>([]);
  const [modal, setModal] = useState<OnlineLevelModalState>({
    open: false,
    row: null,
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await OnlineGameController.list();
    setRows(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    startTransition(() => {
      void refresh();
    });
  }, [refresh]);

  const nextOrder = useMemo(() => {
    if (!rows.length) return 1;
    return Math.max(...rows.map((r) => r.order)) + 1;
  }, [rows]);

  const columns = useMemo(
    () => [
      {
        title: "#",
        dataIndex: "order" as const,
        width: 56,
        sorter: (a: OnlineGameLevel, b: OnlineGameLevel) => a.order - b.order,
      },
      { title: "Name", dataIndex: "name" as const, ellipsis: true },
      // {
      //   title: "Original",
      //   dataIndex: "referenceUri" as const,
      //   width: 100,
      //   render: (uri: string) => (
      //     <Popover content={<Image src={uri} width={320} alt="" />}>
      //       <img
      //         src={uri}
      //         alt=""
      //         className="h-12 w-20 rounded object-cover"
      //         title="Original"
      //       />
      //     </Popover>
      //   ),
      // },
      // {
      //   title: "With differences",
      //   dataIndex: "imageUri" as const,
      //   width: 120,
      //   render: (uri: string) => (
      //     <Popover content={<Image src={uri} width={320} alt="" />}>
      //       <img
      //         src={uri}
      //         alt=""
      //         className="h-12 w-20 rounded object-cover"
      //         title="Playfield"
      //       />
      //     </Popover>
      //   ),
      // },
      {
        title: "Spots",
        key: "spots",
        width: 72,
        render: (_: unknown, r: OnlineGameLevel) => r.differences?.length ?? 0,
      },
      { title: "Time (s)", dataIndex: "timeLimitSec" as const, width: 88 },
      {
        title: "Active",
        dataIndex: "active" as const,
        width: 88,
        render: (active: boolean, r: OnlineGameLevel) => (
          <Switch
            checked={active}
            onChange={(checked) => {
              void (async () => {
                await OnlineGameController.update(r.id, { active: checked });
                void refresh();
              })();
            }}
          />
        ),
      },
      {
        title: "Actions",
        key: "actions",
        width: 120,
        render: (_: unknown, row: OnlineGameLevel) => (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => setModal({ open: true, row })}
            />
            <Button
              type="link"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => {
                void (async () => {
                  const ok = await OnlineGameController.delete(row.id);
                  if (ok) void refresh();
                })();
              }}
            />
          </Space>
        ),
      },
    ],
    [refresh],
  );

  if (loading) return <Loader />;

  return (
    <div className="min-h-[480px]">
      <div className="mb-4">
        <Title level={3} className="mb-1!">
          Online game content
        </Title>
        <Paragraph type="secondary" className="mb-0! max-w-2xl text-sm">
          Upload two images per round: <Tag>original</Tag> (reference) and{" "}
          <Tag>differences</Tag> (playfield). Stored in Firebase Storage under{" "}
          <Tag>online-game/&lt;id&gt;/original</Tag> and{" "}
          <Tag>online-game/&lt;id&gt;/differences</Tag>. The app uses the first
          active row for live PvP.
        </Paragraph>
      </div>

      <div className="mb-3">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModal({ open: true, row: null })}
        >
          New online round
        </Button>
      </div>

      <Table<OnlineGameLevel>
        rowKey="id"
        dataSource={rows}
        columns={columns}
        pagination={{ pageSize: 15 }}
        scroll={{ x: true }}
      />

      <OnlineLevelModal
        open={modal.open}
        initial={modal.row}
        nextOrder={nextOrder}
        onClose={() => setModal({ open: false, row: null })}
        onSaved={refresh}
      />
    </div>
  );
}
