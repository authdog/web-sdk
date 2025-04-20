interface INavbarProps {
    siteName?: string;
}

export const Navbar = ({
    siteName = 'Authdog',
}: INavbarProps) => {
    return (
        <div style={{ backgroundColor: 'blue', padding: '10px', color: 'white' }}>
            {siteName}
            <div style={{ display: 'flex', justifyContent: 'space-between' }} />
        </div>
    )
}