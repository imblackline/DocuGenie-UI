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
import zIndex from '@mui/material/styles/zIndex';

interface Message {
  text: string;
  isUser: boolean;
  files?: {
    name: string;
    content: string;
    type: 'markdown' | 'yaml';
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
      text: "# Getting Started with Our API\n\nThis guide will help you get started with our REST API. Follow these steps to begin:\n\n1. First, obtain your API key\n2. Set up your environment\n3. Make your first API call",
      isUser: true,
      files: [{
        name: "getting-started.md",
        content: "# Getting Started with Our API\n\nThis guide will help you get started with our REST API. Follow these steps to begin:\n\n1. First, obtain your API key\n2. Set up your environment\n3. Make your first API call",
        type: "markdown"
      }]
    },
    { 
      text: "Here are some suggestions to improve your markdown:\n\n1. Add a brief introduction paragraph explaining what the API does\n2. Include a prerequisites section listing required tools/knowledge\n3. Add code examples for each step\n4. Include a troubleshooting section\n5. Add links to related documentation\n\nHere's a revised version:\n\n# Getting Started with Our API\n\nWelcome to our REST API documentation! Our API provides powerful endpoints for managing your resources efficiently.\n\n## Prerequisites\n- Basic understanding of REST APIs\n- cURL or Postman installed\n- Valid API credentials\n\n## Getting Started\n\n1. **Obtain Your API Key**\n   - Log into your dashboard\n   - Navigate to Settings > API Keys\n   - Generate a new key\n\n2. **Set Up Your Environment**\n   ```bash\n   export API_KEY='your-api-key'\n   export API_URL='https://api.example.com'\n   ```\n\n3. **Make Your First API Call**\n   ```bash\n   curl -X GET $API_URL/v1/resources \\\n     -H \"Authorization: Bearer $API_KEY\"\n   ```\n\n## Troubleshooting\n- If you get a 401 error, check your API key\n- For 429 errors, implement rate limiting\n- Contact support for persistent issues",
      isUser: false 
    }
  ],
  2: [
    {
      text: "# API Authentication\n\nTo use our API, you need to authenticate. Here's how:\n\n1. Get your API key from the dashboard\n2. Include it in your requests\n3. That's it!",
      isUser: true,
      files: [{
        name: "auth.md",
        content: "# API Authentication\n\nTo use our API, you need to authenticate. Here's how:\n\n1. Get your API key from the dashboard\n2. Include it in your requests\n3. That's it!",
        type: "markdown"
      }]
    },
    {
      text: "Here are some suggestions to improve your authentication documentation:\n\n1. Add security best practices\n2. Include more detailed examples\n3. Explain different authentication methods\n4. Add error handling information\n\nHere's a revised version:\n\n# API Authentication\n\nSecure authentication is crucial for protecting your API resources. This guide covers all authentication methods and best practices.\n\n## Authentication Methods\n\n### API Key Authentication\n\nThe simplest way to authenticate is using an API key.\n\n1. **Obtain Your API Key**\n   - Log into your dashboard\n   - Navigate to Settings > API Keys\n   - Generate a new key\n\n2. **Include in Requests**\n   ```bash\n   curl -X GET https://api.example.com/v1/resources \\\n     -H \"Authorization: Bearer YOUR_API_KEY\"\n   ```\n\n### OAuth 2.0 Authentication\n\nFor more secure applications, use OAuth 2.0:\n\n```bash\ncurl -X POST https://api.example.com/oauth/token \\\n  -d \"grant_type=client_credentials\" \\\n  -d \"client_id=YOUR_CLIENT_ID\" \\\n  -d \"client_secret=YOUR_CLIENT_SECRET\"\n```\n\n## Security Best Practices\n\n1. Never share your API keys\n2. Rotate keys regularly\n3. Use environment variables\n4. Implement rate limiting\n5. Monitor API usage\n\n## Error Handling\n\n- 401: Invalid or missing authentication\n- 403: Insufficient permissions\n- 429: Too many requests\n\nFor persistent issues, contact our support team.",
      isUser: false
    }
  ]
};

const MarkPolish: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [query, setQuery] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    name: string;
    content: string;
    type: 'markdown' | 'yaml';
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
          name: "Getting Started Guide",
          messages: mockChats[1],
          startTime: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
          id: 2,
          name: "API Authentication",
          messages: mockChats[2],
          startTime: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
        }
      ];
      setConversations(mockConversations);

      /* Original server code - commented out for development
      const response = await axios.get('http://127.0.0.1:8000/api/mark-polish-all-chats');
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
      const currentPath = `/mark-polish/${currentConversationId}`;
      if (window.location.pathname !== currentPath) {
        navigate(currentPath);
      }
    } else if (window.location.pathname !== '/mark-polish') {
      navigate('/mark-polish');
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
      const response = await axios.post(`http://127.0.0.1:8000/api/mark-polish-get-chat`, { chat_id: chatId }, {
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
        navigate('/mark-polish');
      }
    } else {
      setCurrentConversationId(null);
      setMessages([]);
    }
  }, [conversationId, conversations, navigate]);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const isMarkdown = file.name.endsWith('.md');
        const isYaml = file.name.endsWith('.yml') || file.name.endsWith('.yaml');

        if (isMarkdown || isYaml) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target?.result as string;
            const fileType = isMarkdown ? 'markdown' : 'yaml';

            setUploadedFiles(prev => [...prev, {
              name: file.name,
              content: content,
              type: fileType
            }]);

            // Only add markdown content to input
            if (isMarkdown) {
              setQuery(prev => prev + (prev ? '\n\n' : '') + content);
            }
          };
          reader.onerror = () => {
            enqueueSnackbar(t('markPolish.fileUpload.error'), {
              variant: 'error',
              autoHideDuration: 5000,
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'center',
              },
            });
          };
          reader.readAsText(file);
        } else {
          enqueueSnackbar(t('markPolish.fileUpload.invalidType'), {
            variant: 'error',
            autoHideDuration: 5000,
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
          });
        }
      });
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

    // Combine all markdown files and query content
    const allMarkdownContent = [
      query,
      ...uploadedFiles
        .filter(file => file.type === 'markdown')
        .map(file => file.content)
    ].filter(Boolean).join('\n\n');

    // Combine all yaml files
    const allYamlContent = uploadedFiles
      .filter(file => file.type === 'yaml')
      .map(file => file.content)
      .join('\n---\n');

    const userMessage: Message = {
      text: allMarkdownContent || 'OpenAPI Specifications uploaded',
      isUser: true,
      files: uploadedFiles
    };

    console.log('User message:', userMessage);
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
      const mockResponse = {
        suggestions: `Here are some suggestions to improve your markdown:\n\n` +
          `1. Add a clear introduction\n` +
          `2. Include code examples\n` +
          `3. Add a troubleshooting section\n` +
          `4. Include best practices\n\n` +
          `Here's a revised version:\n\n` +
          `# ${allMarkdownContent.split('\n')[0].replace('#', '').trim()}\n\n` +
          `This is a sample improved version of your markdown. In a real implementation, this would be generated by the AI based on your content.\n\n` +
          `## Introduction\n\nAdd a brief introduction here.\n\n` +
          `## Code Examples\n\n\`\`\`bash\n# Your code examples here\n\`\`\`\n\n` +
          `## Troubleshooting\n\nCommon issues and solutions.\n\n` +
          `## Best Practices\n\n- Best practice 1\n- Best practice 2\n- Best practice 3`
      };

      /* Original server code - commented out for development
      const { data } = await axios.post('http://127.0.0.1:8000/api/mark-polish', {
        markdown: allMarkdownContent,
        chat_id: currentConversationId,
        openapi_spec: allYamlContent || undefined
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      */

      const aiMessage: Message = {
        // text: data.suggestions || t('markPolish.responses.error'),
        text: mockResponse.suggestions || t('markPolish.responses.error'),
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

      clearUploadedFiles();
      await fetchConversationMessages(currentConversationId);
    } catch (error) {
      const errorMessage: Message = {
        text: t('markPolish.responses.error'),
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
    navigate(`/mark-polish/${newConversation.id}`);
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
            Mark Polish
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
                  <Typography variant="caption" sx={{ display: 'block',fontWeight: 'light', fontSize: '1.2rem', mb: 0.5 }}>
                    {t('markPolish.conversation.instruction')}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block',fontWeight: 'light',opacity: 0.7, fontSize: '1.2rem', mb: 0.5 }}>
                    {t('markPolish.conversation.subInstruction')}
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
                      {t('markPolish.fileUpload.uploaded')}:
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
                      {t('markPolish.fileUpload.clear')}
                    </Button>
                  </Box>
                )}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <input
                    type="file"
                    accept=".md,.yml,.yaml"
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
                    placeholder={t('markPolish.input.placeholder')}
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
                          {t('markPolish.input.send')}
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

export default MarkPolish;