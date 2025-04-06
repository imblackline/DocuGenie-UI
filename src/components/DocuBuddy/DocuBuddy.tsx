import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useSnackbar } from 'notistack';
import {
    Container,
    Typography,
    Grid,
    Paper,
    TextField,
    Button,
    Box,
    Stack,
    Chip,
    CircularProgress,
    useTheme,
    alpha,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Input,
} from '@mui/material';
import {
    Add as AddIcon,
    CleaningServices,
    Menu as MenuIcon,
    AttachFile as AttachFileIcon,
    Clear as ClearIcon,
    Api as ApiIcon,
    Description as DescriptionIcon,
    Send as SendIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    text: string;
    isUser: boolean;
    files?: {
        name: string;
        content: string;
        type: 'markdown' | 'yaml' | 'code';
    }[];
}

interface Conversation {
    id: number;
    messages: Message[];
    name: string;
    startTime: string;
}

// Mock chat data
const mockChats: { [key: number]: Message[] } = {
    1: [
        { 
            text: "I need help writing documentation for my REST API. Here's my OpenAPI spec:\n\n```yaml\nopenapi: 3.0.0\ninfo:\n  title: User Management API\n  version: 1.0.0\npaths:\n  /users:\n    get:\n      summary: List users\n      responses:\n        '200':\n          description: List of users\n```",
            isUser: true,
            files: [{
                name: "api-spec.yaml",
                content: "openapi: 3.0.0\ninfo:\n  title: User Management API\n  version: 1.0.0\npaths:\n  /users:\n    get:\n      summary: List users\n      responses:\n        '200':\n          description: List of users",
                type: "yaml"
            }]
        },
        { 
            text: "I'll help you improve your API documentation. Here's a more comprehensive version:\n\n```yaml\nopenapi: 3.0.0\ninfo:\n  title: User Management API\n  version: 1.0.0\n  description: API for managing user accounts and profiles\n  contact:\n    email: support@example.com\npaths:\n  /users:\n    get:\n      summary: List users\n      description: Retrieve a paginated list of users\n      parameters:\n        - name: page\n          in: query\n          description: Page number\n          schema:\n            type: integer\n            default: 1\n        - name: limit\n          in: query\n          description: Number of items per page\n          schema:\n            type: integer\n            default: 10\n      responses:\n        '200':\n          description: List of users\n          content:\n            application/json:\n              schema:\n                type: object\n                properties:\n                  data:\n                    type: array\n                    items:\n                      $ref: '#/components/schemas/User'\n                  total:\n                    type: integer\n                  page:\n                    type: integer\n                  limit:\n                    type: integer\n        '400':\n          description: Invalid parameters\n        '401':\n          description: Unauthorized\ncomponents:\n  schemas:\n    User:\n      type: object\n      properties:\n        id:\n          type: integer\n        username:\n          type: string\n        email:\n          type: string\n        created_at:\n          type: string\n          format: date-time",
            isUser: false 
        }
    ],
    2: [
        {
            text: "Can you help me write a README for my project? Here's my project structure:\n\n```markdown\n# Project Structure\n\n/src\n  /components\n  /utils\n  /api\n/package.json\n/README.md\n```",
            isUser: true,
            files: [{
                name: "project-structure.md",
                content: "# Project Structure\n\n/src\n  /components\n  /utils\n  /api\n/package.json\n/README.md",
                type: "markdown"
            }]
        },
        {
            text: "Here's a comprehensive README template for your project:\n\n```markdown\n# Project Name\n\nA brief description of what your project does and its main features.\n\n## Features\n\n- Feature 1: Description\n- Feature 2: Description\n- Feature 3: Description\n\n## Installation\n\n```bash\n# Clone the repository\ngit clone https://github.com/username/project-name.git\n\n# Navigate to project directory\ncd project-name\n\n# Install dependencies\nnpm install\n```\n\n## Project Structure\n\n```\n/src\n  /components    # React components\n  /utils         # Utility functions\n  /api           # API integration\n/package.json    # Project dependencies\n/README.md       # Project documentation\n```\n\n## Usage\n\nDescribe how to use your project, with examples.\n\n## API Documentation\n\nIf your project has an API, document the endpoints here.\n\n## Contributing\n\n1. Fork the repository\n2. Create your feature branch\n3. Commit your changes\n4. Push to the branch\n5. Create a Pull Request\n\n## License\n\nThis project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.\n\n## Contact\n\nYour Name - [@yourtwitter](https://twitter.com/yourtwitter)\n\nProject Link: [https://github.com/username/project-name](https://github.com/username/project-name)",
            isUser: false
        }
    ],
    3: [
        {
            text: "I need help documenting my database schema. Here's my SQL:\n\n```sql\nCREATE TABLE users (\n  id INT PRIMARY KEY,\n  username VARCHAR(50),\n  email VARCHAR(100)\n);\n\nCREATE TABLE posts (\n  id INT PRIMARY KEY,\n  user_id INT,\n  title VARCHAR(200),\n  content TEXT\n);",
            isUser: true,
            files: [{
                name: "schema.sql",
                content: "CREATE TABLE users (\n  id INT PRIMARY KEY,\n  username VARCHAR(50),\n  email VARCHAR(100)\n);\n\nCREATE TABLE posts (\n  id INT PRIMARY KEY,\n  user_id INT,\n  title VARCHAR(200),\n  content TEXT\n);",
                type: "code"
            }]
        },
        {
            text: "Here's a comprehensive documentation for your database schema:\n\n```markdown\n# Database Schema Documentation\n\n## Overview\nThis document describes the database schema for the application, including tables, relationships, and field descriptions.\n\n## Tables\n\n### Users Table\nStores user account information.\n\n| Column    | Type         | Description                    | Constraints     |\n|-----------|--------------|--------------------------------|-----------------|\n| id        | INT          | Unique identifier for the user | PRIMARY KEY     |\n| username  | VARCHAR(50)  | User's display name            | NOT NULL        |\n| email     | VARCHAR(100) | User's email address           | UNIQUE, NOT NULL|\n\n### Posts Table\nStores user-generated posts.\n\n| Column    | Type         | Description                    | Constraints     |\n|-----------|--------------|--------------------------------|-----------------|\n| id        | INT          | Unique identifier for the post | PRIMARY KEY     |\n| user_id   | INT          | Reference to users table       | FOREIGN KEY     |\n| title     | VARCHAR(200) | Post title                     | NOT NULL        |\n| content   | TEXT         | Post content                   | NOT NULL        |\n\n## Relationships\n\n- One-to-Many: Users to Posts\n  - A user can have multiple posts\n  - Each post belongs to one user\n  - Foreign key: posts.user_id references users.id\n\n## Indexes\n\n- users.email (UNIQUE)\n- posts.user_id (FOREIGN KEY)\n\n## Notes\n\n- Consider adding created_at and updated_at timestamps\n- Add appropriate indexes for frequently queried columns\n- Implement soft delete for posts\n- Add data validation constraints",
            isUser: false
        }
    ]
};

const DocuBuddy: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [query, setQuery] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState<Array<{
        name: string;
        content: string;
        type: 'markdown' | 'yaml' | 'code';
    }>>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const theme = useTheme();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { conversationId } = useParams();
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = async () => {
        try {
            // For development/testing: Use mock data instead of server
            const mockConversations: Conversation[] = [
                {
                    id: 1,
                    name: "REST API Documentation",
                    messages: mockChats[1],
                    startTime: new Date(Date.now() - 86400000).toISOString() // 1 day ago
                },
                {
                    id: 2,
                    name: "Project README",
                    messages: mockChats[2],
                    startTime: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
                },
                {
                    id: 3,
                    name: "Database Schema Docs",
                    messages: mockChats[3],
                    startTime: new Date(Date.now() - 21600000).toISOString() // 6 hours ago
                }
            ];
            setConversations(mockConversations);

            /* Original server code - commented out for development
            const response = await axios.get('http://127.0.0.1:8000/api/docu-body-all-chats');
            const data = response.data;

            if (data.chats) {
                const transformedConversations: Conversation[] = data.chats.map((chat: any) => ({
                    id: chat.id,
                    messages: [],
                    name: chat.chat_name,
                    startTime: chat.start_chat_time
                }));
                setConversations(transformedConversations);
            }
            */
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    useEffect(() => {
        fetchConversations();
        if (conversationId) {
            fetchConversationMessages(parseInt(conversationId));
        }
    }, []);

    // Sync URL with state (URL -> state)

    // Sync state with URL (state -> URL)
    useEffect(() => {
        if (currentConversationId) {
            const currentPath = `/docu-buddy/${currentConversationId}`;
            if (window.location.pathname !== currentPath) {
                navigate(currentPath);
            }
        } else if (window.location.pathname !== '/docu-buddy') {
            navigate('/docu-buddy');
        }
    }, [currentConversationId, navigate]);

    const fetchConversationMessages = async (chatId: number) => {
        try {
            const response = await axios.post(`http://127.0.0.1:8000/api/docu-body-get-chat`, { chat_id: chatId }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = response.data;

            if (data.chat_details) {
                // Transform chat details into messages
                const messages: Message[] = data.chat_details.map((detail: any) => ([
                    { text: detail.prompt, isUser: true },
                    { text: detail.chat_response, isUser: false }
                ])).flat();

                // Update the conversation's messages
                setConversations(prev => prev.map(conv =>
                    conv.id === chatId
                        ? { ...conv, messages }
                        : conv
                ));

                // Update current messages if this is the active conversation
                if (chatId === currentConversationId) {
                    setMessages(messages);
                }
            }
        } catch (error) {
            console.error(`Error fetching messages for chat ${chatId}:`, error);
        }
    };

    useEffect(() => {
        if (conversationId || currentConversationId) {
            const id = conversationId ? parseInt(conversationId) : currentConversationId;
            const conversation = conversations.find(conv => conv.id === id);
            if (conversation && conversation.id === currentConversationId) {
                setMessages(conversation.messages);
                setCurrentConversationId(id);
            }
            else if (conversation && conversation.id != currentConversationId && currentConversationId == null) {
                setMessages(conversation.messages);
                setCurrentConversationId(id);
            }
            else if (conversation && conversation.id != currentConversationId && currentConversationId != null) {
                const currentConversation = conversations.find(conv => conv.id === currentConversationId);

                setMessages(currentConversation?.messages || []);
                setCurrentConversationId(currentConversationId);
            }
            else {
                navigate('/docu-buddy');
            }
        } else {
            setCurrentConversationId(null);
            setMessages([]);
        }
    }, [conversationId, conversations, navigate]);

    // Utility function to parse code blocks and markdown
    const parseMessage = (text: string) => {
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        const segments: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
        let lastIndex = 0;
        let match;

        while ((match = codeBlockRegex.exec(text)) !== null) {
            // Add text before code block as markdown
            if (match.index > lastIndex) {
                segments.push({
                    type: 'text',
                    content: text.slice(lastIndex, match.index)
                });
            }

            // Add code block
            segments.push({
                type: 'code',
                language: match[1] || 'text',
                content: match[2].trim()
            });

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text as markdown
        if (lastIndex < text.length) {
            segments.push({
                type: 'text',
                content: text.slice(lastIndex)
            });
        }

        return segments;
    };

    const handleSubmit = async () => {
        if (!currentConversationId) return;
        if (!query.trim() && uploadedFiles.length === 0) return;

        const userMessage: Message = {
            text: query,
            isUser: true,
            files: uploadedFiles
        };

        setMessages(prev => [...prev, userMessage]);
        setConversations(prev =>
            prev.map(conv =>
                conv.id === currentConversationId
                    ? { ...conv, messages: [...conv.messages, userMessage] }
                    : conv
            )
        );

        setQuery('');
        setLoading(true);

        try {
            // For development/testing: Use mock response instead of server
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
            
            // Generate mock documentation based on the content
            const mockDocumentation = `Here's a comprehensive documentation for your content:\n\n` +
                `## Overview\n\n${query || 'Content analysis and documentation'}.\n\n` +
                `## Content Analysis\n\n` +
                uploadedFiles.map(file => `### ${file.name}\n\`\`\`${file.type === 'yaml' ? 'yaml' : file.type === 'markdown' ? 'markdown' : 'text'}\n${file.content}\n\`\`\`\n`).join('\n') +
                `\n## Documentation\n\n` +
                `1. **Purpose**\n   - Main objectives\n   - Key features\n\n` +
                `2. **Structure**\n   - Organization\n   - Components\n\n` +
                `3. **Usage**\n   - How to use\n   - Examples\n\n` +
                `4. **Best Practices**\n   - Guidelines\n   - Recommendations\n\n` +
                `## Additional Recommendations\n\n` +
                `1. Add more detailed descriptions\n` +
                `2. Include usage examples\n` +
                `3. Add troubleshooting section\n` +
                `4. Consider adding diagrams\n` +
                `5. Include version history`;

            /* Original server code - commented out for development
            const { data } = await axios.post('http://127.0.0.1:8000/api/docu-body', {
                query: query,
                chat_id: currentConversationId,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            */

            const aiMessage: Message = {
                // text: data.suggestions || t('docuBuddy.responses.error'),
                text: mockDocumentation || t('docuBuddy.responses.error'),
                isUser: false,
            };

            setMessages(prev => [...prev, aiMessage]);
            setConversations(prev =>
                prev.map(conv =>
                    conv.id === currentConversationId
                        ? { ...conv, messages: [...conv.messages, aiMessage] }
                        : conv
                )
            );
            // await fetchConversationMessages(currentConversationId);
        } catch (error) {
            const errorMessage: Message = {
                text: t('docuBuddy.responses.error'),
                isUser: false,
            };
            setMessages(prev => [...prev, errorMessage]);
            setConversations(prev =>
                prev.map(conv =>
                    conv.id === currentConversationId
                        ? { ...conv, messages: [...conv.messages, errorMessage] }
                        : conv
                )
            );
        } finally {
            setLoading(false);
            //FIXME remove it 
            setUploadedFiles([]);
        }
    };

    const handleConversationSelect = (conversation: Conversation) => {
        setCurrentConversationId(conversation.id);
        setMessages(conversation.messages);
        fetchConversationMessages(conversation.id);
    };

    const addConversation = () => {
        const newConversation: Conversation = {
            id: Math.max(1, ...conversations.map(c => c.id)) + 1,
            messages: [],
            name: `Conversation ${Math.max(1, ...conversations.map(c => c.id)) + 1}`,
            startTime: new Date().toISOString()
        };
        setConversations(prev => [newConversation, ...prev]);
        setCurrentConversationId(newConversation.id);
        navigate(`/docu-buddy/${newConversation.id}`);
    };

    return (
        <Container maxWidth={false} sx={{ height: '91vh', display: 'flex', flexDirection: 'row', pb: 2, pt: 1 }}>
            <Box sx={{
                width: sidebarOpen ? '250px' : '0px',
                minWidth: sidebarOpen ? '250px' : '0px',
                p: sidebarOpen ? 2 : 0,
                pt: 0,
                pl: 0,
                overflow: 'hidden',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                    width: '0.2em',
                },
                '&::-webkit-scrollbar-track': {
                    backgroundColor: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#9ebddb',
                    borderRadius: '10px',
                },

                overflowX: 'hidden',
                transition: theme.transitions.create(['width', 'min-width', 'padding'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.standard,
                }),
            }}>
                <Box sx={{
                    display: 'flex',
                    position: 'sticky',
                    top: 0,
                    bgcolor: 'background.default',
                    zIndex: 1,
                    paddingTop: 2,
                    pl: 2,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                }}>
                    <Typography variant="h6" gutterBottom sx={{ opacity: sidebarOpen ? 1 : 0 }}>
                        Conversation History
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={addConversation}
                        sx={{
                            mt: 0,
                            p: 0.5,
                            minWidth: 0,
                            opacity: sidebarOpen ? 1 : 0,
                            transition: theme.transitions.create('opacity'),
                        }}
                    >
                        <AddIcon fontSize="small" />
                    </Button>
                </Box>
                <List sx={{ mt: 1 }}>
                    {[...conversations].map((conversation) => (
                        <ListItem
                            component="div"
                            key={conversation.id}
                            onClick={() => handleConversationSelect(conversation)}
                            sx={{
                                borderRadius: 2,
                                bgcolor: currentConversationId === conversation.id
                                    ? alpha(theme.palette.primary.main, 0.1)
                                    : 'transparent',
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                },
                                cursor: 'pointer',
                            }}
                        >
                            <ListItemText primary={conversation.name} />
                        </ListItem>
                    ))}
                </List>
            </Box>

            <Grid container spacing={0} sx={{
                flexGrow: 1,
                mt: 2,
                position: 'relative',
            }}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%) translateY(-15px)',
                        bgcolor: '#9ebddb',
                        color: theme.palette.mode === 'dark'
                            ? '#000'
                            : '#fff',
                        px: 8,
                        py: 0.5,
                        borderRadius: '8px',
                        zIndex: 1,
                    }}
                >
                    <Typography variant="h6" component="div" sx={{
                        color: theme.palette.mode === 'dark' ? 'black' : 'white',
                        fontSize: '1rem'
                    }}>
                        Docu Buddy
                    </Typography>
                </Box>
                <Grid item xs={12} sx={{ maxHeight: '100%' }}>
                    <Paper
                        elevation={3}
                        sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 2,
                            p: 2,
                            pt: 1,
                            bgcolor: 'background.paper',
                            position: 'relative',
                        }}
                    >
                        <IconButton
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            sx={{
                                position: 'absolute',
                                left: -17,
                                top: 0,
                                bottom: 0,
                                margin: 'auto',
                                height: 'fit-content',
                                bgcolor: '#9ebddb',
                                zIndex: 1,
                                color: theme.palette.mode === 'dark'
                                    ? '#000'
                                    : '#fff',
                                boxShadow: theme.shadows[2],
                                '&:hover': {
                                    bgcolor: '#77a5d4',
                                },
                            }}
                            size="small"
                        >
                            <MenuIcon sx={{ transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: theme.transitions.create('transform') }} />
                        </IconButton>
                        <Box
                            sx={{
                                flexGrow: 1,
                                overflowY: 'auto',
                                position: 'relative',
                                px: 2,
                                py: 1,
                                '&::-webkit-scrollbar': { width: '8px' },
                                '&::-webkit-scrollbar-track': {
                                    bgcolor: theme.palette.mode === 'dark'
                                        ? alpha(theme.palette.common.white, 0.05)
                                        : alpha(theme.palette.common.black, 0.05),
                                    borderRadius: '4px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    bgcolor: theme.palette.mode === 'dark'
                                        ? alpha(theme.palette.common.white, 0.2)
                                        : alpha(theme.palette.common.black, 0.2),
                                    borderRadius: '4px',
                                    '&:hover': {
                                        bgcolor: theme.palette.mode === 'dark'
                                            ? alpha(theme.palette.common.white, 0.3)
                                            : alpha(theme.palette.common.black, 0.3),
                                    },
                                },
                            }}
                        >
                            {messages.length === 0 && conversationId &&
                                <Box sx={{
                                    position: 'absolute',
                                    width: 'fit-content',
                                    height: 'fit-content',
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: 0,
                                    margin: 'auto',
                                    zIndex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 'light', fontSize: '1.2rem', mb: 0.5 }}>
                                        {t('docuBuddy.conversation.instruction')}
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 'light', opacity: 0.7, fontSize: '1.2rem', mb: 0.5 }}>
                                        {t('docuBuddy.conversation.subInstruction')}
                                    </Typography>
                                </Box>
                            }
                            {messages.map((message, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                                        mb: 2,
                                    }}
                                >
                                    <Paper
                                        sx={{
                                            p: 2,
                                            maxWidth: '80%',
                                            bgcolor: message.isUser
                                                ? theme.palette.mode === 'dark'
                                                    ? alpha(theme.palette.primary.main, 0.2)
                                                    : alpha(theme.palette.primary.main, 0.1)
                                                : theme.palette.mode === 'dark'
                                                    ? alpha(theme.palette.common.white, 0.05)
                                                    : alpha(theme.palette.common.black, 0.05),
                                            color: message.isUser
                                                ? theme.palette.mode === 'dark'
                                                    ? theme.palette.primary.light
                                                    : theme.palette.primary.main
                                                : 'text.primary',
                                            fontFamily: message.isUser ? 'inherit' : 'monospace',
                                        }}
                                    >
                                        <Typography
                                            component="div"
                                            sx={{
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word',
                                                '& p': { margin: 0 },
                                                '& ul, & ol': { margin: '0.5em 0', paddingLeft: '1.5em' },
                                                '& a': {
                                                    color: theme.palette.primary.main,
                                                    textDecoration: 'none',
                                                    '&:hover': {
                                                        textDecoration: 'underline'
                                                    }
                                                },
                                                '& code': {
                                                    backgroundColor: theme.palette.mode === 'dark'
                                                        ? alpha(theme.palette.common.white, 0.1)
                                                        : alpha(theme.palette.common.black, 0.1),
                                                    padding: '2px 4px',
                                                    borderRadius: '4px',
                                                    fontFamily: 'monospace'
                                                },
                                                '& table': {
                                                    borderCollapse: 'collapse',
                                                    width: '100%',
                                                    margin: '0.5em 0'
                                                },
                                                '& th, & td': {
                                                    border: `1px solid ${theme.palette.divider}`,
                                                    padding: '8px',
                                                    textAlign: 'left'
                                                },
                                                '& blockquote': {
                                                    borderLeft: `4px solid ${theme.palette.divider}`,
                                                    margin: '0.5em 0',
                                                    padding: '0.5em 1em',
                                                    backgroundColor: theme.palette.mode === 'dark'
                                                        ? alpha(theme.palette.common.white, 0.05)
                                                        : alpha(theme.palette.common.black, 0.05)
                                                }
                                            }}
                                        >
                                            {parseMessage(message.text).map((segment, idx) => (
                                                segment.type === 'code' ? (
                                                    <SyntaxHighlighter
                                                        key={idx}
                                                        language={segment.language}
                                                        style={theme.palette.mode === 'dark' ? vscDarkPlus : oneLight}
                                                        customStyle={{
                                                            margin: '0.5em 0',
                                                            borderRadius: '4px',
                                                            fontSize: '0.9em',
                                                            backgroundColor: theme.palette.mode === 'dark'
                                                                ? '#1E1E1E'  // Dark background
                                                                : '#F8F8F8', // Light background
                                                        }}
                                                    >
                                                        {segment.content}
                                                    </SyntaxHighlighter>
                                                ) : (
                                                    <ReactMarkdown
                                                        key={idx}
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            // Override code blocks to prevent conflict with our custom handler
                                                            code: ({ node, inline, className, children, ...props }) => {
                                                                if (inline) {
                                                                    return <code {...props}>{children}</code>;
                                                                }
                                                                return null;
                                                            }
                                                        }}
                                                    >
                                                        {segment.content}
                                                    </ReactMarkdown>
                                                )
                                            ))}
                                        </Typography>
                                    </Paper>
                                </Box>
                            ))}
                            <div ref={messagesEndRef} />
                        </Box>
                        {!conversationId &&
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                bgcolor: 'background.paper',
                            }}>
                                <Typography variant="h6" color="text.secondary" align="center">
                                    {t('docuBuddy.conversation.select')}
                                </Typography>
                                <Typography variant="h6" color="text.secondary" align="center">
                                    {t('docuBuddy.conversation.or')}
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={addConversation}
                                    startIcon={<AddIcon />}
                                    sx={{ mt: 2 }}
                                >
                                    {t('docuBuddy.conversation.create')}
                                </Button>
                            </Box>
                        }
                        {conversationId &&
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>

                                    <TextField
                                        fullWidth
                                        multiline
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder={t('docuBuddy.input.placeholder')}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSubmit();
                                            }
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: theme.palette.mode === 'dark'
                                                    ? alpha(theme.palette.common.white, 0.05)
                                                    : alpha(theme.palette.common.black, 0.05),
                                                overflowY: 'auto',
                                            },
                                            '& .MuiInputBase-input': {
                                                overflowY: 'auto',
                                            }
                                        }}
                                        minRows={1}
                                        maxRows={5}
                                    />
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleSubmit}
                                        disabled={loading || !query.trim() && uploadedFiles.length === 0}
                                        sx={{ minWidth: '100px' }}
                                    >
                                        {loading ? (
                                            <CircularProgress size={24} />
                                        ) : (
                                            <>
                                                <SendIcon />
                                                <Box component="span" sx={{ ml: 1 }}>
                                                    {t('docuBuddy.input.send')}
                                                </Box>
                                            </>
                                        )}
                                    </Button>
                                </Box>
                            </Box>}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default DocuBuddy;