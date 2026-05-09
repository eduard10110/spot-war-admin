import AuthController from "@controllers/auth";
import { LogoutOutlined } from "@ant-design/icons";
import { Button, Layout, Menu, theme } from "antd";
import type { MenuProps } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router";

const { Content, Footer, Header } = Layout;

const menuItems: MenuProps["items"] = [
  { key: "/", label: "Home" },
  { key: "/practice", label: "Practice" },
  { key: "/online", label: "Online" },
];

function selectedMenuKey(pathname: string): string {
  if (pathname === "/" || pathname === "") return "/";
  if (pathname.startsWith("/practice")) return "/practice";
  if (pathname.startsWith("/online")) return "/online";
  return "/";
}

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const onMenuClick: MenuProps["onClick"] = (e) => {
    navigate(e.key);
  };

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4">
        <button
          type="button"
          className="flex cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-left"
          onClick={() => navigate("/")}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-cyan-500 text-sm font-bold text-white">
            SW
          </div>
          <span className="text-base font-semibold text-white">
            Spot War Admin
          </span>
        </button>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedMenuKey(location.pathname)]}
          items={menuItems}
          onClick={onMenuClick}
          className="min-w-0 flex-1 justify-center border-0 bg-transparent md:max-w-xl"
        />
        <Button
          type="text"
          className="text-slate-300"
          icon={<LogoutOutlined />}
          onClick={() => void AuthController.logOut()}
        >
          Sign out
        </Button>
      </Header>
      <Content className="px-4 py-6 md:px-8">
        <div
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
          className="min-h-[calc(100vh-140px)] p-6 shadow-sm"
        >
          <Outlet />
        </div>
      </Content>
      <Footer className="text-center text-slate-500">
        Spot War · difference-battle
      </Footer>
    </Layout>
  );
}
