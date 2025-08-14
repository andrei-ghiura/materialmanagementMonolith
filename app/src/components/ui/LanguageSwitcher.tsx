import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Globe } from 'react-bootstrap-icons';
import useI18n from '../../hooks/useI18n';

const LanguageSwitcher: React.FC = () => {
    const { changeLanguage, getCurrentLanguage } = useI18n();

    const languages = [
        { code: 'ro', name: 'Română', flag: '🇷🇴' },
        { code: 'en', name: 'English', flag: '🇺🇸' }
    ];

    const currentLanguage = languages.find(lang => lang.code === getCurrentLanguage()) || languages[0];

    const handleLanguageChange = (languageCode: string) => {
        changeLanguage(languageCode);
    };

    return (
        <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="language-dropdown" size="sm">
                <Globe className="me-2" />
                {currentLanguage.flag} {currentLanguage.name}
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {languages.map((language) => (
                    <Dropdown.Item
                        key={language.code}
                        active={language.code === getCurrentLanguage()}
                        onClick={() => handleLanguageChange(language.code)}
                    >
                        {language.flag} {language.name}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default LanguageSwitcher;
