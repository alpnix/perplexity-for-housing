'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import useUserStore from '@/store/userStore';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user, logout } = useUserStore();
    const pathname = usePathname();
    const router = useRouter();

    const tenantRoutes = [
        { name: 'GrotBot', href: '/' },
        { name: 'Properties', href: '/properties' },
        { name: 'Roommates', href: '/roommates' },
    ];

    const routes = tenantRoutes;

    const handleLogout = () => {
        logout();
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push('/');
        setIsUserMenuOpen(false);
    };

    const handleNavigation = (href: string) => {
        // Allow navigation to home page regardless of authentication
        if (href === '/') {
            router.push(href);
            return;
        }

        // Check if user is authenticated for protected routes
        if (!user) {
            // Redirect to sign-in page if not authenticated
            router.push('/sign-in');
            return;
        }

        // Navigate to the requested page if authenticated
        router.push(href);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const desktopLinkClasses = (href: string) =>
        `inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 cursor-pointer ${
            pathname === href
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-primary hover:border-primary'
        }`;

    const mobileLinkClasses = (href: string) =>
        `block py-2 pl-3 pr-4 text-base font-medium border-l-4 hover:border-primary cursor-pointer ${
            pathname === href
                ? 'border-primary text-primary'
                : 'text-gray-500 hover:text-primary hover:border-primary'
        }`;

    return (
        <nav className="bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <img src="/assets/images/logo.png" alt="Logo" className="h-8 w-8" />
                        <Link href="/" className="ml-2 flex items-center">
                            <span className="text-xl font-bold text-primary">GrotN</span>
                        </Link>
                    </div>

                    <div className="hidden md:flex flex-1 justify-center space-x-8">
                        {routes.map((item) => (
                            <button 
                                key={item.name} 
                                onClick={() => handleNavigation(item.href)}
                                className={desktopLinkClasses(item.href)}
                            > 
                                {item.name}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center">
                        <div className="relative ml-3" ref={dropdownRef}>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            >
                                <span className="sr-only">Open user menu</span>
                                {user?.image ? (
                                    <img src={user.image} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
                                ) : (
                                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                                )}
                            </button>

                            {isUserMenuOpen && (
                                <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    {user ? (
                                        <>
                                            <Link
                                                href="/profile"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Update Profile
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Logout
                                            </button>
                                        </>
                                    ) : (
                                        <Link
                                            href="/sign-in"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Sign in
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="ml-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary md:hidden"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="md:hidden">
                    <div className="space-y-1 pb-3 pt-2">
                        {routes.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => {
                                    handleNavigation(item.href);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={mobileLinkClasses(item.href)}
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;