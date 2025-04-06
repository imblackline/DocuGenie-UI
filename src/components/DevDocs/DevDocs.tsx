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
    type: 'code' | 'yaml';
    language?: string;
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
      text: "Can you help me document this Python function?\n\n```python\ndef calculate_total(items, discount=0):\n    total = sum(item.price for item in items)\n    if discount:\n        total = total * (1 - discount)\n    return total\n```",
      isUser: true,
      files: [{
        name: "calculator.py",
        content: "def calculate_total(items, discount=0):\n    total = sum(item.price for item in items)\n    if discount:\n        total = total * (1 - discount)\n    return total",
        type: "code",
        language: "python"
      },
      {
        name: "calculator.py",
        content: "def calculate_total(items, discount=0):\n    total = sum(item.price for item in items)\n    if discount:\n        total = total * (1 - discount)\n    return total",
        type: "code",
        language: "python"
      }]
      
    },
    { 
      text: "Here's a comprehensive documentation for your function:\n\n```python\n\"\"\"\nCalculates the total price of items with an optional discount.\n\nArgs:\n    items (list): A list of items, each having a 'price' attribute.\n    discount (float, optional): A discount rate between 0 and 1. Defaults to 0.\n\nReturns:\n    float: The total price after applying the discount.\n\nExample:\n    >>> items = [Item(price=10), Item(price=20)]\n    >>> calculate_total(items, discount=0.1)\n    27.0\n\nRaises:\n    ValueError: If discount is not between 0 and 1.\n\"\"\"\ndef calculate_total(items, discount=0):\n    if not 0 <= discount <= 1:\n        raise ValueError(\"Discount must be between 0 and 1\")\n    total = sum(item.price for item in items)\n    if discount:\n        total = total * (1 - discount)\n    return total\n```\n\nI've added:\n1. A detailed docstring with Args, Returns, and Raises sections\n2. An example usage\n3. Input validation for the discount parameter\n4. Type hints for better code clarity",
      isUser: false 
    }
  ],
  2: [
    {
      text: "I need help documenting this React component:\n\n```typescript\ninterface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\nconst UserProfile: React.FC<{ user: User }> = ({ user }) => {\n  return (\n    <div className=\"user-profile\">\n      <h2>{user.name}</h2>\n      <p>{user.email}</p>\n    </div>\n  );\n};\n```",
      isUser: true,
      files: [{
        name: "UserProfile.tsx",
        content: "interface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\nconst UserProfile: React.FC<{ user: User }> = ({ user }) => {\n  return (\n    <div className=\"user-profile\">\n      <h2>{user.name}</h2>\n      <p>{user.email}</p>\n    </div>\n  );\n};\n}",
        type: "code",
        language: "typescript"
      }]
    },
    {
      text: "Here's a well-documented version of your React component:\n\n```typescript\n/**\n * User interface representing the shape of user data\n */\ninterface User {\n  /** Unique identifier for the user */\n  id: number;\n  /** User's full name */\n  name: string;\n  /** User's email address */\n  email: string;\n}\n\n/**\n * UserProfile Component\n * \n * Displays a user's profile information including their name and email.\n * This component is part of the user management system.\n *\n * @component\n * @example\n * ```tsx\n * const user = { id: 1, name: 'John Doe', email: 'john@example.com' };\n * <UserProfile user={user} />\n * ```\n */\nconst UserProfile: React.FC<{ user: User }> = ({ user }) => {\n  return (\n    <div className=\"user-profile\">\n      <h2>{user.name}</h2>\n      <p>{user.email}</p>\n    </div>\n  );\n};\n\n// Add PropTypes for runtime type checking\nexport default UserProfile;\n```\n\nI've added:\n1. JSDoc comments for the component and interface\n2. Detailed property descriptions\n3. Usage example\n4. TypeScript type definitions\n5. Component export statement\n\nAdditional recommendations:\n1. Consider adding error boundaries\n2. Add loading states\n3. Include accessibility attributes\n4. Add unit tests\n5. Consider adding prop validation",
      isUser: false
    }
  ]
};

const devDocs: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [query, setQuery] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    name: string;
    content: string;
    type: 'code' | 'yaml';
    language?: string;
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
          name: "Python Function Documentation",
          messages: mockChats[1],
          startTime: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
          id: 2,
          name: "React Component Documentation",
          messages: mockChats[2],
          startTime: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
        }
      ];
      setConversations(mockConversations);

      /* Original server code - commented out for development
      const response = await axios.get('http://127.0.0.1:8000/api/dev-docs-all-chats');
      const data = response.data;

      if (data.chats) {
        // Transform the chat data into conversations
        const transformedConversations: Conversation[] = data.chats.map((chat: any) => ({
          id: chat.id,
          messages: [], // You'll need to fetch messages separately if needed
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
      const currentPath = `/dev-docs/${currentConversationId}`;
      if (window.location.pathname !== currentPath) {
        navigate(currentPath);
      }
    } else if (window.location.pathname !== '/dev-docs') {
      navigate('/dev-docs');
    }
  }, [currentConversationId, navigate]);

  const fetchConversationMessages = async (chatId: number) => {
    try {
      // For development/testing: Use mock data instead of server
      const conversation = conversations.find(conv => conv.id === chatId);
      if (conversation) {
        setMessages(conversation.messages);
        if (chatId === currentConversationId) {
          setMessages(conversation.messages);
        }
      }

      /* Original server code - commented out for development
      const response = await axios.post(`http://127.0.0.1:8000/api/dev-docs-get-chat`, { chat_id: chatId }, {
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
      */
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
        navigate('/dev-docs');
      }
    } else {
      setCurrentConversationId(null);
      setMessages([]);
    }
  }, [conversationId, conversations, navigate]);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

        // Define supported file types
        const codeExtensions = ['js', 'py', 'java', 'cpp', 'ts', 'tsx', 'jsx', 'php', 'rb', 'go', 'rs'];
        const yamlExtensions = ['yml', 'yaml'];

        if (codeExtensions.includes(fileExtension)) {
          setUploadedFiles(prev => [...prev, {
            name: file.name,
            content,
            type: 'code',
            language: fileExtension
          }]);
        } else if (yamlExtensions.includes(fileExtension)) {
          setUploadedFiles(prev => [...prev, {
            name: file.name,
            content,
            type: 'yaml'
          }]);
        } else {
          enqueueSnackbar(t('devDocs.upload.unsupportedFile'), { variant: 'error' });
        }
      };
      reader.readAsText(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearUploadedFiles = () => {
    setUploadedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!currentConversationId) return;
    if (!query.trim() && uploadedFiles.length === 0) return;

    // Get all code files content with their languages
    const codeFiles = uploadedFiles
      .filter(file => file.type === 'code')
      .map(file => ({
        content: file.content,
        language: file.language,
        name: file.name
      }));

    // Get all yaml files content
    const allYamlContent = uploadedFiles
      .filter(file => file.type === 'yaml')
      .map(file => ({
        content: file.content,
        name: file.name
      }));

    const userMessage: Message = {
      text: query || 'Code files and OpenAPI Specifications uploaded',
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
      
      // Generate mock documentation based on the code content
      const mockDocumentation = `Here's a comprehensive documentation for your code:\n\n` +
        `## Overview\n\nThis code ${query || 'implements functionality'}.\n\n` +
        `## Code Analysis\n\n` +
        codeFiles.map(file => `### ${file.name}\n\`\`\`${file.language}\n${file.content}\n\`\`\`\n`).join('\n') +
        `\n## Documentation\n\n` +
        `1. **Function/Component Purpose**\n   - Main functionality\n   - Key features\n\n` +
        `2. **Parameters/Props**\n   - Detailed description of inputs\n   - Type information\n\n` +
        `3. **Return Values**\n   - What the code returns\n   - Possible outcomes\n\n` +
        `4. **Examples**\n   \`\`\`\n   // Example usage\n   \`\`\`\n\n` +
        `5. **Best Practices**\n   - Error handling\n   - Performance considerations\n   - Security notes\n\n` +
        `## Additional Recommendations\n\n` +
        `1. Add comprehensive error handling\n` +
        `2. Include input validation\n` +
        `3. Add unit tests\n` +
        `4. Consider edge cases\n` +
        `5. Document any dependencies`;

      /* Original server code - commented out for development
      const { data } = await axios.post('http://127.0.0.1:8000/api/dev-docs', {
        user_input: query,
        chat_id: currentConversationId,
        code_files: codeFiles,
        openapi_files: allYamlContent || undefined
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      */

      const aiMessage: Message = {
        // text: data.documentation || t('devDocs.responses.error'),
        text: mockDocumentation || t('devDocs.responses.error'),
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
    } catch (error) {
      const errorMessage: Message = {
        text: t('devDocs.responses.error'),
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
    navigate(`/dev-docs/${newConversation.id}`);
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
            bgcolor: 'primary.main',
            color: theme.palette.mode === 'dark' ? 'black' : 'white',
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
            Dev Docs
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
                zIndex: 1,
                margin: 'auto',
                height: 'fit-content',
                bgcolor: '#9ebddb',
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
                px: 2,
                py: 1,
                position: 'relative',
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
                    {t('devDocs.conversation.instruction')}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 'light', opacity: 0.7, fontSize: '1.2rem', mb: 0.5 }}>
                    {t('devDocs.conversation.subInstruction')}
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
                    {message.files && message.files.length > 0 && (
                      <Box sx={{ mb: 1, p: 1, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                          Uploaded files: {message.files.map(file => file.name).join(', ')}
                        </Typography>
                      </Box>
                    )}
                    <Typography
                      sx={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {message.text}
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
                  {t('markPolish.conversation.select')}
                </Typography>
                <Typography variant="h6" color="text.secondary" align="center">
                  {t('markPolish.conversation.or')}
                </Typography>
                <Button
                  variant="contained"
                  onClick={addConversation}
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                >
                  {t('markPolish.conversation.create')}
                </Button>
              </Box>
            }
            {conversationId &&
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {uploadedFiles.length > 0 && (
                  <Box sx={{ mt: 1, mb: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      {t('devDocs.fileUpload.uploaded')}:
                    </Typography>
                    {uploadedFiles.map((file, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        {file.type === 'yaml' ? <ApiIcon fontSize="small" /> : <DescriptionIcon fontSize="small" />}
                        <Typography variant="body2">{file.name}</Typography>
                      </Box>
                    ))}
                    <Button
                      size="small"
                      startIcon={<ClearIcon />}
                      onClick={clearUploadedFiles}
                      sx={{ mt: 1 }}
                    >
                      {t('devDocs.fileUpload.clear')}
                    </Button>
                  </Box>
                )}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <input
                    type="file"
                    accept=".js,.py,.java,.cpp,.ts,.tsx,.jsx,.php,.rb,.go,.rs,.yml,.yaml"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                  />

                  <TextField
                    fullWidth
                    multiline
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('devDocs.input.placeholder')}
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
                    variant="outlined"
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    <AttachFileIcon />
                  </Button>
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
                          {t('devDocs.input.send')}
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

export default devDocs;