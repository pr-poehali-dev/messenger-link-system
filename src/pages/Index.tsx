import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { toast } from '@/hooks/use-toast';

interface User {
  username: string;
  isAdmin: boolean;
  isVerified: boolean;
  trialDaysLeft: number;
  isPro: boolean;
  connectedPlatforms: string[];
}

interface Message {
  id: string;
  platform: 'telegram' | 'vk' | 'max' | 'whatsapp';
  sender: string;
  text: string;
  time: string;
  unread: boolean;
}

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('messages');

  const mockMessages: Message[] = [
    { id: '1', platform: 'telegram', sender: 'Алекс Петров', text: 'Привет! Как дела?', time: '14:32', unread: true },
    { id: '2', platform: 'vk', sender: 'Мария Иванова', text: 'Смотри какое фото нашла!', time: '13:15', unread: true },
    { id: '3', platform: 'whatsapp', sender: 'Дима', text: 'Созвон в 15:00?', time: '12:48', unread: false },
    { id: '4', platform: 'max', sender: 'Команда MAX', text: 'Новое обновление доступно', time: '10:22', unread: false },
    { id: '5', platform: 'telegram', sender: 'Игровой клуб', text: '🎮 Турнир начинается!', time: 'Вчера', unread: false },
  ];

  const handleLogin = () => {
    if (username === 'skzry' && password === '22') {
      setCurrentUser({
        username: 'skzry',
        isAdmin: true,
        isVerified: true,
        trialDaysLeft: 0,
        isPro: true,
        connectedPlatforms: ['telegram', 'vk', 'max', 'whatsapp']
      });
      setIsLoggedIn(true);
      toast({ title: '🚀 Добро пожаловать, Админ!', description: 'Вход выполнен успешно' });
    } else if (username && password) {
      setCurrentUser({
        username: username,
        isAdmin: false,
        isVerified: false,
        trialDaysLeft: 3,
        isPro: false,
        connectedPlatforms: ['telegram']
      });
      setIsLoggedIn(true);
      toast({ title: '✨ Добро пожаловать!', description: `У вас ${3} дня бесплатного доступа` });
    }
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      telegram: 'Send',
      vk: 'Users',
      max: 'Flame',
      whatsapp: 'MessageCircle'
    };
    return icons[platform] || 'MessageSquare';
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      telegram: 'bg-blue-500',
      vk: 'bg-blue-600',
      max: 'bg-orange-500',
      whatsapp: 'bg-green-500'
    };
    return colors[platform] || 'bg-gray-500';
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/10">
        <Card className="w-full max-w-md animate-scale-in border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center animate-pulse-glow">
                <Icon name="Zap" size={40} className="text-white" />
              </div>
            </div>
            <CardTitle className="text-4xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Mess_skz
            </CardTitle>
            <CardDescription className="text-lg">
              Все твои сообщения в одном месте 🎮
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-muted/50 border-primary/30 focus:border-primary"
              />
              <Input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="bg-muted/50 border-primary/30 focus:border-primary"
              />
            </div>
            <Button 
              onClick={handleLogin} 
              className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-all text-lg font-bold h-12"
            >
              Войти 🚀
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Первые 3 дня бесплатно! 🎁
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/50 backdrop-blur-sm bg-card/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
              <Icon name="Zap" size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Mess_skz
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1 border-primary/50">
              <Icon name="User" size={14} />
              {currentUser?.username}
            </Badge>
            {currentUser?.isAdmin && (
              <Badge className="bg-accent gap-1">
                <Icon name="Shield" size={14} />
                Админ
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={() => setIsLoggedIn(false)}>
              <Icon name="LogOut" size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-muted/50">
            <TabsTrigger value="messages" className="gap-2 data-[state=active]:bg-primary">
              <Icon name="MessageSquare" size={18} />
              Сообщения
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-primary">
              <Icon name="User" size={18} />
              Профиль
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-4 animate-fade-in">
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Inbox" size={24} className="text-primary" />
                    Входящие
                  </CardTitle>
                  <Badge variant="secondary" className="gap-1">
                    <div className="h-2 w-2 rounded-full bg-secondary animate-pulse-glow" />
                    {mockMessages.filter(m => m.unread).length} новых
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {mockMessages.map((msg) => (
                      <Card
                        key={msg.id}
                        className={`transition-all hover:scale-[1.02] cursor-pointer border-l-4 ${
                          msg.unread ? 'border-l-primary bg-primary/5' : 'border-l-transparent'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`h-12 w-12 rounded-full ${getPlatformColor(msg.platform)} flex items-center justify-center flex-shrink-0`}>
                              <Icon name={getPlatformIcon(msg.platform)} size={24} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h4 className="font-semibold text-foreground truncate">{msg.sender}</h4>
                                <span className="text-xs text-muted-foreground flex-shrink-0">{msg.time}</span>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{msg.text}</p>
                              <Badge variant="outline" className="mt-2 text-xs capitalize">
                                {msg.platform}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4 animate-fade-in">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="User" size={24} className="text-primary" />
                  Профиль
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 ring-4 ring-primary/30">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-white">
                      {currentUser?.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold">{currentUser?.username}</h3>
                      {currentUser?.isVerified && (
                        <div className="relative group">
                          <Icon name="BadgeCheck" size={24} className="text-blue-500 animate-pulse-glow cursor-help" />
                          <div className="absolute left-0 top-full mt-2 hidden group-hover:block z-10">
                            <div className="bg-popover text-popover-foreground text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap border border-border">
                              Подтверждённый пользователь
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {currentUser?.isAdmin && (
                        <Badge className="bg-accent">Администратор</Badge>
                      )}
                      {currentUser?.isPro ? (
                        <Badge className="bg-gradient-to-r from-primary to-secondary">PRO</Badge>
                      ) : (
                        <Badge variant="outline">Пробная версия: {currentUser?.trialDaysLeft} дня</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Icon name="Link" size={18} className="text-primary" />
                    Подключённые платформы
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {['telegram', 'vk', 'max', 'whatsapp'].map((platform) => {
                      const isConnected = currentUser?.connectedPlatforms.includes(platform);
                      return (
                        <Card
                          key={platform}
                          className={`transition-all ${
                            isConnected
                              ? 'border-primary/50 bg-primary/5'
                              : 'border-dashed opacity-50 hover:opacity-100'
                          }`}
                        >
                          <CardContent className="p-4 flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full ${getPlatformColor(platform)} flex items-center justify-center`}>
                              <Icon name={getPlatformIcon(platform)} size={20} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium capitalize">{platform}</p>
                              <p className="text-xs text-muted-foreground">
                                {isConnected ? '✓ Подключено' : 'Не подключено'}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {!currentUser?.isPro && (
                  <Card className="border-accent/50 bg-gradient-to-br from-accent/10 to-transparent">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Icon name="Sparkles" size={24} className="text-accent flex-shrink-0" />
                        <div>
                          <h4 className="font-bold mb-1">Получить PRO версию</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            После пробного периода свяжитесь с админом для активации PRO
                          </p>
                          <Button 
                            className="bg-accent hover:bg-accent/90 gap-2"
                            onClick={() => window.open('https://t.me/skzry', '_blank')}
                          >
                            <Icon name="Send" size={16} />
                            Написать @skzry
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
