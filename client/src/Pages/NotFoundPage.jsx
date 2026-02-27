import FullLogolight from '../assets/FullLogolight.png';
import { useThemeStore } from '../store/themeStore';

const NotFoundPage = () => {
    const { darkMode } = useThemeStore();

    const Logo = () =>{
        if (darkMode) {
            return <img src={FullLogolight} alt="Logo" className='h-50'
            style={
            { filter: 'invert(1) brightness(1.1)'}
            }/>
        }
        return <img src={FullLogolight} alt="Logo" className='h-50'/>
    }

    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center bg-bg">
            <Logo />
            <h1 className="text-4xl font-bold text-primary mb-5">404</h1>
            <h2 className="text-3xl font-bold text-text-secondary">Page Not Found</h2>
        </div>
    );
};


export default NotFoundPage;