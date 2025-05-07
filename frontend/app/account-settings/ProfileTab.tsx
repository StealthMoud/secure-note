'use client';
import React, { useState } from 'react';
import { useAccountSettingsLogic } from './accountSettingsLogic';
import {
    PencilIcon,
    UserCircleIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    XCircleIcon,
    XMarkIcon,
    CalendarIcon,
    GlobeAltIcon,
} from '@heroicons/react/24/outline';

const countries = [
    'Afghanistan',
    'Albania',
    'Algeria',
    'Andorra',
    'Angola',
    'Antigua and Barbuda',
    'Argentina',
    'Armenia',
    'Australia',
    'Austria',
    'Azerbaijan',
    'Bahamas',
    'Bahrain',
    'Bangladesh',
    'Barbados',
    'Belarus',
    'Belgium',
    'Belize',
    'Benin',
    'Bhutan',
    'Bolivia',
    'Bosnia and Herzegovina',
    'Botswana',
    'Brazil',
    'Brunei',
    'Bulgaria',
    'Burkina Faso',
    'Burundi',
    'Cabo Verde',
    'Cambodia',
    'Cameroon',
    'Canada',
    'Central African Republic',
    'Chad',
    'Chile',
    'China',
    'Colombia',
    'Comoros',
    'Congo (Congo-Brazzaville)',
    'Costa Rica',
    'Croatia',
    'Cuba',
    'Cyprus',
    'Czechia (Czech Republic)',
    'Denmark',
    'Djibouti',
    'Dominica',
    'Dominican Republic',
    'Ecuador',
    'Egypt',
    'El Salvador',
    'Equatorial Guinea',
    'Eritrea',
    'Estonia',
    'Eswatini',
    'Ethiopia',
    'Fiji',
    'Finland',
    'France',
    'Gabon',
    'Gambia',
    'Georgia',
    'Germany',
    'Ghana',
    'Greece',
    'Grenada',
    'Guatemala',
    'Guinea',
    'Guinea-Bissau',
    'Guyana',
    'Haiti',
    'Honduras',
    'Hungary',
    'Iceland',
    'India',
    'Indonesia',
    'Iran',
    'Iraq',
    'Ireland',
    'Israel',
    'Italy',
    'Jamaica',
    'Japan',
    'Jordan',
    'Kazakhstan',
    'Kenya',
    'Kiribati',
    'Kuwait',
    'Kyrgyzstan',
    'Laos',
    'Latvia',
    'Lebanon',
    'Lesotho',
    'Liberia',
    'Libya',
    'Liechtenstein',
    'Lithuania',
    'Luxembourg',
    'Madagascar',
    'Malawi',
    'Malaysia',
    'Maldives',
    'Mali',
    'Malta',
    'Marshall Islands',
    'Mauritania',
    'Mauritius',
    'Mexico',
    'Micronesia',
    'Moldova',
    'Monaco',
    'Mongolia',
    'Montenegro',
    'Morocco',
    'Mozambique',
    'Myanmar (Burma)',
    'Namibia',
    'Nauru',
    'Nepal',
    'Netherlands',
    'New Zealand',
    'Nicaragua',
    'Niger',
    'Nigeria',
    'North Korea',
    'North Macedonia',
    'Norway',
    'Oman',
    'Pakistan',
    'Palau',
    'Panama',
    'Papua New Guinea',
    'Paraguay',
    'Peru',
    'Philippines',
    'Poland',
    'Portugal',
    'Qatar',
    'Romania',
    'Russia',
    'Rwanda',
    'Saint Kitts and Nevis',
    'Saint Lucia',
    'Saint Vincent and the Grenadines',
    'Samoa',
    'San Marino',
    'Sao Tome and Principe',
    'Saudi Arabia',
    'Senegal',
    'Serbia',
    'Seychelles',
    'Sierra Leone',
    'Singapore',
    'Slovakia',
    'Slovenia',
    'Solomon Islands',
    'Somalia',
    'South Africa',
    'South Korea',
    'South Sudan',
    'Spain',
    'Sri Lanka',
    'Sudan',
    'Suriname',
    'Sweden',
    'Switzerland',
    'Syria',
    'Taiwan',
    'Tajikistan',
    'Tanzania',
    'Thailand',
    'Timor-Leste',
    'Togo',
    'Tonga',
    'Trinidad and Tobago',
    'Tunisia',
    'Turkey',
    'Turkmenistan',
    'Tuvalu',
    'Uganda',
    'Ukraine',
    'United Arab Emirates',
    'United Kingdom',
    'United States',
    'Uruguay',
    'Uzbekistan',
    'Vanuatu',
    'Vatican City',
    'Venezuela',
    'Vietnam',
    'Yemen',
    'Zambia',
    'Zimbabwe',
];

interface ProfileTabProps {
    handleUpdateProfile: () => Promise<void>;
}

export default function ProfileTab({ handleUpdateProfile }: ProfileTabProps) {
    const {
        user,
        firstName,
        setFirstName,
        lastName,
        setLastName,
        nickname,
        setNickname,
        birthday,
        setBirthday,
        country,
        setCountry,
        loading,
        message,
        error,
        isExitingError,
        isExitingMessage,
        dismissMessage,
    } = useAccountSettingsLogic();
    const [activeSubTab, setActiveSubTab] = useState('basic');
    const [countryFilter, setCountryFilter] = useState('');
    const [isCountryOpen, setIsCountryOpen] = useState(false);

    const subTabs = [
        { name: 'basic', label: 'Basic Info', icon: UserCircleIcon },
        { name: 'account', label: 'Account Info', icon: InformationCircleIcon },
    ];

    const handleChange = (setter: (value: string) => void) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setter(e.target.value);
    };

    const normalizedBirthday = birthday ? new Date(birthday).toISOString().split('T')[0] : '';
    const filteredCountries = countries.filter((c) => c.toLowerCase().includes(countryFilter.toLowerCase()));

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-[0_0_10px_rgba(0,0,0,0.05)] dark:shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-500 ease-in-out transform hover:scale-105 hover:rotate-x-1 hover:rotate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] perspective-[1000px] animate-fadeInShort">
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                {subTabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveSubTab(tab.name)}
                        className={`flex items-center px-3 py-2 text-sm font-medium transition-all duration-500 ease-in-out transform hover:scale-105 ${
                            activeSubTab === tab.name
                                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        <tab.icon className="w-5 h-5 mr-2" />
                        {tab.label}
                    </button>
                ))}
            </div>
            {activeSubTab === 'basic' && (
                <div className="space-y-4">
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <PencilIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                            First Name
                        </label>
                        <div className="relative">
                            <PencilIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400 pointer-events-none" />
                            <input
                                value={firstName}
                                onChange={handleChange(setFirstName)}
                                placeholder={user?.user.firstName || 'Enter first name'}
                                className="mt-1 w-full pl-10 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
                                disabled={loading}
                                aria-label="First name"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <PencilIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                            Last Name
                        </label>
                        <div className="relative">
                            <PencilIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400 pointer-events-none" />
                            <input
                                value={lastName}
                                onChange={handleChange(setLastName)}
                                placeholder={user?.user.lastName || 'Enter last name'}
                                className="mt-1 w-full pl-10 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
                                disabled={loading}
                                aria-label="Last name"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <PencilIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                            Nickname
                        </label>
                        <div className="relative">
                            <PencilIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400 pointer-events-none" />
                            <input
                                value={nickname}
                                onChange={handleChange(setNickname)}
                                placeholder={user?.user.nickname || 'Enter nickname'}
                                className="mt-1 w-full pl-10 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
                                disabled={loading}
                                aria-label="Nickname"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <CalendarIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                            Birthday
                        </label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400 pointer-events-none" />
                            <input
                                type="date"
                                value={normalizedBirthday}
                                onChange={handleChange(setBirthday)}
                                placeholder={user?.user.birthday || 'Select birthday'}
                                className="mt-1 w-full pl-10 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
                                disabled={loading}
                                aria-label="Birthday"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <GlobeAltIcon className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                            Country
                        </label>
                        <div className="relative">
                            <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                value={countryFilter}
                                onChange={(e) => setCountryFilter(e.target.value)}
                                onFocus={() => setIsCountryOpen(true)}
                                placeholder={country || 'Search countries...'}
                                className="mt-1 w-full pl-10 p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
                                disabled={loading}
                                aria-label="Country filter"
                            />
                        </div>
                        {isCountryOpen && (
                            <select
                                value={country}
                                onChange={(e) => {
                                    handleChange(setCountry)(e);
                                    setCountryFilter('');
                                    setIsCountryOpen(false);
                                }}
                                onBlur={() => setIsCountryOpen(false)}
                                className="mt-1 w-full p-2 border border-gray-200 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
                                disabled={loading}
                                size={5}
                                aria-label="Country select"
                            >
                                <option value="">Select a country</option>
                                {filteredCountries.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <button
                        onClick={handleUpdateProfile}
                        disabled={loading}
                        className={`bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 transition-all duration-500 ease-in-out transform hover:scale-105 active:scale-95 flex items-center ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        aria-label="Save profile"
                    >
                        {loading ? (
                            <svg
                                className="animate-spin h-5 w-5 mr-2 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        ) : (
                            <CheckCircleIcon className="w-5 h-5 mr-2" />
                        )}
                        {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            )}
            {activeSubTab === 'account' && (
                <div className="space-y-4">
                    <div>
                        <label className="text-gray-700 dark:text-gray-300">Username</label>
                        <p className="mt-1 text-gray-900 dark:text-gray-200">{user?.user.username}</p>
                    </div>
                    <div>
                        <label className="text-gray-700 dark:text-gray-300">Email</label>
                        <p className="mt-1 text-gray-900 dark:text-gray-200">{user?.user.email}</p>
                    </div>
                </div>
            )}
            {error && (
                <p
                    className={`bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm p-2 rounded-md flex items-center transition-opacity duration-500 ${
                        isExitingError ? 'opacity-0' : 'opacity-100 animate-fadeInShort'
                    }`}
                >
                    <XCircleIcon className="h-5 w-5 mr-2 text-red-800 dark:text-red-200" />
                    {error}
                    <button onClick={() => dismissMessage('error')} className="ml-auto">
                        <XMarkIcon className="h-5 w-5 text-red-800 dark:text-red-200" />
                    </button>
                </p>
            )}
            {message && (
                <p
                    className={`bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm p-2 rounded-md flex items-center transition-opacity duration-500 ${
                        isExitingMessage ? 'opacity-0' : 'opacity-100 animate-fadeInShort'
                    }`}
                >
                    <CheckCircleIcon className="h-5 w-5 mr-2 text-green-800 dark:text-green-200" />
                    {message}
                    <button onClick={() => dismissMessage('message')} className="ml-auto">
                        <XMarkIcon className="h-5 w-5 text-green-800 dark:text-green-200" />
                    </button>
                </p>
            )}
        </div>
    );
}