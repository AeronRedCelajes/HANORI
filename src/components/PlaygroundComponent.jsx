import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Container, Row, Col, Dropdown, DropdownButton, Tab, Tabs, Button, Spinner } from 'react-bootstrap';
import { ProfilePlaygroundNavbarComponent } from './ProfilePlaygroundNavbarComponent';
import '../style/playground.css';

export const PlaygroundComponent = () => {
    // For navigating to the dashboard page
    const navigate_dashboard = useNavigate();

    const handleDashboardClick = () => {
        navigate_dashboard('/dashboard');
    };

    // State to manage the selected programming language in the dropdown
    const [selectedLanguage, setSelectedLanguage] = useState({ name: 'Java', imgSrc: '/src/assets/java2.png' });

    // Handle language selection and update the dropdown
    const handleSelect = (language) => {
        const imgSources = {
            'C#': '/src/assets/c.png',
            'Java': '/src/assets/java2.png',
            'Python': '/src/assets/py.png',
        };
        setSelectedLanguage({ name: language, imgSrc: imgSources[language] });
    };

    // Mapping programming languages to API-compatible codes
    const languageMap = {
        'C#': 'cs', // API expects 'cs' for C#
        'Java': 'java', // API expects 'java' for Java
        'Python': 'py', // API expects 'py' for Python
    };

    // Regular expressions to validate code syntax for each language
    const languagePatterns = {
        'C#': /namespace\s+|Console\.WriteLine/i,
        'Java': /public\s+class\s+|System\.out\.println/i,
        'Python': /def\s+|print\(/i,
    };

    // Manage the active tab in the playground (e.g., main.py or code.java)
    const [key, setKey] = useState('main');

    // State for the code editor, input editor, and output display
    const [code, setCode] = useState('// Write your code here'); // Initial code editor content
    const [input, setInput] = useState(''); // Optional input for the code
    const [output, setOutput] = useState(''); // Output/result of code execution
    const [loading, setLoading] = useState(false); // Loading state for the "Run Code" button

    // Function to handle the "Run Code" button click
    const handleRunCode = async () => {
        // Validate the code to ensure it matches the selected language syntax
        const selectedLanguagePattern = languagePatterns[selectedLanguage.name];
        if (!selectedLanguagePattern.test(code)) {
            setOutput(`Error: The code doesn't match the selected language (${selectedLanguage.name}). Please ensure the code is written in ${selectedLanguage.name}.`);
            return;
        }

        setLoading(true); // Show loading spinner
        setOutput(''); // Clear previous output
        try {
            // API call to compile and execute the code
            const response = await fetch('https://api.codex.jaagrav.in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: code, // User-written code
                    language: languageMap[selectedLanguage.name], // API-compatible language code
                    input: input, // Optional input for the code
                }),
            });
            const data = await response.json();
            if (response.ok) {
                setOutput(data.output || 'No output'); // Display the output or a "No output" message
            } else {
                setOutput(`Error: ${data.error || 'Something went wrong'}`); // Display API error messages
            }
        } catch (error) {
            setOutput(`Error: ${error.message}`); // Handle unexpected errors
        } finally {
            setLoading(false); // Hide loading spinner
        }
    };

    return (
        <>
            {/* Custom Navbar for the Playground */}
            <ProfilePlaygroundNavbarComponent />

            <div className="playground">
                <div className="playground-container">
                    <div className="playground-header">
                        <Row>
                            <Col sm={10} className="left-corner">
                                {/* Tabs to switch between files in the editor */}
                                <Tabs defaultActiveKey={key} id="tab" onSelect={(k) => setKey(k)} fill>
                                    <Tab eventKey="main" title="main.py"></Tab>
                                    <Tab eventKey="code.java" title="code.java"></Tab>
                                </Tabs>
                                {/* Icon for adding new tabs/files */}
                                <a href="#"><span className="bi bi-plus-square-fill"></span></a>
                            </Col>

                            <Col sm={1} className="right-corner">
                                {/* Dropdown for selecting programming language */}
                                <DropdownButton
                                    className="playground-dropdown"
                                    id="language-dropdown"
                                    size="sm"
                                    title={
                                        <>
                                            <img src={selectedLanguage.imgSrc} style={{ width: '20px', marginRight: '8px' }} alt="language-icon" />
                                            {selectedLanguage.name}
                                        </>
                                    }
                                    onSelect={(eventKey) => handleSelect(eventKey)}
                                >
                                    <Dropdown.Item eventKey="C#"><img src="/src/assets/c.png" alt="csharp-icon" />C#</Dropdown.Item>
                                    <Dropdown.Item eventKey="Java"><img src="/src/assets/java2.png" alt="java-icon" />Java</Dropdown.Item>
                                    <Dropdown.Item eventKey="Python"><img src="/src/assets/py.png" alt="python-icon" />Python</Dropdown.Item>
                                </DropdownButton>
                            </Col>
                        </Row>

                        {/* Divider below the header */}
                        <div className="header-border"></div>
                    </div>

                    <div className="playground-editor">
                        {/* Code editor textarea */}
                        <textarea
                            className="code-editor"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            rows={15}
                            placeholder="Write your code here..."
                        ></textarea>
                        {/* Input editor textarea */}
                        <textarea
                            className="input-editor"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            rows={5}
                            placeholder="Provide input here... (optional)"
                        ></textarea>
                    </div>

                    <div className="playground-bottom">
                        <div className="right-corner">
                            {/* Run Code button */}
                            <Button onClick={handleRunCode} disabled={loading}>
                                {loading ? <Spinner animation="border" size="sm" /> : 'Run Code'}
                            </Button>
                        </div>
                    </div>

                    <div className="playground-output">
                        {/* Output display area */}
                        <h5>Output:</h5>
                        <pre>{output}</pre>
                    </div>
                </div>
            </div>
        </>
    );
};