interface INavbarProps {
  siteName?: string;
  children?: React.ReactNode;
}

export const Navbar = ({ siteName = "Authdog", children }: INavbarProps) => {
  return (
    <div style={{ backgroundColor: "blue", padding: "10px", color: "white" }}>
      {siteName}
      {children}
      <div style={{ display: "flex", justifyContent: "space-between" }} />
    </div>
  );
};
