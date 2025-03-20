'use client';
import React, { useState } from 'react';
import { useAccountSettingsLogic } from './accountSettingsLogic';
import { PencilIcon, UserCircleIcon, InformationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia",
    "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
    "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
    "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia",
    "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)",
    "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
    "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany",
    "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary",
    "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan",
    "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
    "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali",
    "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia",
    "Montenegro", "Morocco", "Mozambique", "Myanmar (Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand",
    "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama",
    "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
    "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
    "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland",
    "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
    "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
    "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

interface ProfileTabProps {
    handleUpdateProfile: () => Promise<void>;
}

export default function ProfileTab({ handleUpdateProfile }: ProfileTabProps) {
    const {
        user,
        firstName, setFirstName,
        lastName, setLastName,
        nickname, setNickname,
        birthday, setBirthday,
        country, setCountry,
        loading, message, error,
    } = useAccountSettingsLogic();
    const [activeSubTab, setActiveSubTab] = useState('basic');
    const [countryFilter, setCountryFilter] = useState('');
    const [isCountryOpen, setIsCountryOpen] = useState(false);

    const subTabs = [
        { name: 'basic', label: 'Basic Info', icon: UserCircleIcon },
        { name: 'account', label: 'Account Info', icon: InformationCircleIcon },
    ];

    const handleChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setter(e.target.value);
    };

    const normalizedBirthday = birthday ? new Date(birthday).toISOString().split('T')[0] : '';
    const filteredCountries = countries.filter(c => c.toLowerCase().includes(countryFilter.toLowerCase()));

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                {subTabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveSubTab(tab.name)}
                        className={`flex items-center px-3 py-2 text-sm font-medium ${
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
                            <PencilIcon className="w-5 h-5 mr-2" />
                            First Name
                        </label>
                        <input
                            value={firstName}
                            onChange={handleChange(setFirstName)}
                            placeholder={user?.user.firstName || 'Enter first name'}
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <PencilIcon className="w-5 h-5 mr-2" />
                            Last Name
                        </label>
                        <input
                            value={lastName}
                            onChange={handleChange(setLastName)}
                            placeholder={user?.user.lastName || 'Enter last name'}
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <PencilIcon className="w-5 h-5 mr-2" />
                            Nickname
                        </label>
                        <input
                            value={nickname}
                            onChange={handleChange(setNickname)}
                            placeholder={user?.user.nickname || 'Enter nickname'}
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <PencilIcon className="w-5 h-5 mr-2" />
                            Birthday
                        </label>
                        <input
                            type="date"
                            value={normalizedBirthday}
                            onChange={handleChange(setBirthday)}
                            placeholder={user?.user.birthday || 'Select birthday'}
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="flex items-center text-gray-700 dark:text-gray-300">
                            <PencilIcon className="w-5 h-5 mr-2" />
                            Country
                        </label>
                        <input
                            type="text"
                            value={countryFilter}
                            onChange={(e) => setCountryFilter(e.target.value)}
                            onFocus={() => setIsCountryOpen(true)}
                            placeholder={country || 'Search countries...'}
                            className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                            disabled={loading}
                        />
                        {isCountryOpen && (
                            <select
                                value={country}
                                onChange={(e) => {
                                    handleChange(setCountry)(e);
                                    setCountryFilter('');
                                    setIsCountryOpen(false);
                                }}
                                onBlur={() => setIsCountryOpen(false)}
                                className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                                disabled={loading}
                            >
                                <option value="">Select a country</option>
                                {filteredCountries.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    <button
                        onClick={handleUpdateProfile}
                        disabled={loading}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
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
            {message && <p className="text-green-500 dark:text-green-400 text-sm mt-4">{message}</p>}
            {error && <p className="text-red-500 dark:text-red-400 text-sm mt-4">{error}</p>}
        </div>
    );
}