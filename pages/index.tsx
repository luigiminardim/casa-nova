import {
  Alert,
  Card,
  Container,
  Grid,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Snackbar,
  Skeleton,
  Button,
  Link,
  Box,
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
} from "react-query";
import { Item, ItemImage } from "../src/Item";
import { useLocalStorage, useClipboard } from "@mantine/hooks";
import { User } from "../src/User";
import { ContentCopy as ContentCopyIcon } from "@mui/icons-material";
import Image from "next/image";

function useUser() {
  const [userName, setUserName] = useLocalStorage<string | null>({
    key: "user.name",
    defaultValue: null,
  });
  const onLogin = (name: string) => {
    setUserName(name);
  };
  const user: null | User = userName
    ? {
        name: userName,
      }
    : null;
  return {
    user,
    onLogin,
  };
}

function useItems({ user }: { user: null | User }) {
  const _2min = 1000 * 60 * 2;
  const queryClient = useQueryClient();
  const { isLoading, error, data } = useQuery<Item[]>(
    "items",
    () => fetch("/api/items").then((res) => res.json()),
    {
      refetchInterval: _2min,
    }
  );
  const allocateItem = useMutation(
    async (item: Item) => {
      return fetch(`/api/items/${item.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      }).then((res) => res.json());
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("items");
      },
    }
  );

  return {
    isLoading,
    error: error ? "Erro ao carregar os items" : null,
    userItems: data?.filter(
      (item) => user && item.responsableUser?.name === user.name
    ),
    freeItems: data?.filter((item) => !user || !item.responsableUser),
    allocateItem,
  };
}

function useItem(items: Item) {
  const {
    isLoading: isLoadingImage,
    error,
    data: imageData,
  } = useQuery<ItemImage>(
    `/items/image/${items.id}`,
    () =>
      fetch(`/api/items/image/${encodeURIComponent(items.exampleUrl)}`).then(
        (res) => res.json()
      ),
    {
      refetchOnWindowFocus: false,
    }
  );
  const imageState = !isLoadingImage && !error ? imageData : null;
  return { imageState };
}

function UserDialog({
  user,
  onLogin,
}: {
  user: null | User;
  onLogin: (name: string) => void;
}) {
  const isOpen = user === null;
  return (
    <Dialog open={isOpen}>
      <DialogTitle>Quem é você?</DialogTitle>
      <DialogContent>
        <form
          id="userForm"
          onSubmit={(e) => {
            e.preventDefault();
            // @ts-ignore
            const name = e.target.name.value as string;
            if (name.length > 3) {
              onLogin(name);
            }
          }}
        >
          <DialogContentText>
            Insira seu nome para podermos identificar você.
          </DialogContentText>
          <TextField
            autoFocus
            name="name"
            variant="standard"
            autoComplete="name"
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button type="submit" form="userForm">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Header() {
  return (
    <Card sx={{ padding: 4 }}>
      <Stack direction="column" spacing={4}>
        <Typography variant="h3">Chá de casa nova!</Typography>
        <Image
          src="/casall.jpg"
          alt="casal"
          width={901}
          height={637}
          style={{ borderRadius: "4px", marginTop: "16px" }}
          objectFit="cover"
        />
        <Stack spacing={1}>
          <Typography variant="subtitle1">
            <b>Data:</b> 15 de maio (domingo) às 16h.
          </Typography>
          <Typography variant="subtitle1">
            <b> Local:</b> SQN 411, bloco A, salão de festas.
          </Typography>
        </Stack>
        <Stack spacing={1}>
          <Typography>Olá pessoal!</Typography>
          <Typography>
            Estamos passando por uma grande mudança. Finalmente teremos nossa
            casinha! (O casamento não foi dessa vez...) Portanto, gostariamos de
            compartilhar nossa alegria nesse chá de casa nova.
          </Typography>
          <Typography>
            Sua presença será nosso maior presente. Ainda assim, ficaremos muito
            agradecidos se puderem ajudar com algum item da lista.
          </Typography>
          <Alert severity="info">
            São apenas sugestões. Sintam-se livres para colocar um pedacinho de
            vocês em nosso lar.
          </Alert>
        </Stack>
      </Stack>
    </Card>
  );
}

function FreeItemListItem({
  item,
  allocate,
}: {
  item: Item;
  allocate: UseMutationResult<any, unknown, Item, unknown>;
}) {
  const { imageState } = useItem(item);
  return (
    <ListItem
      alignItems="flex-start"
      secondaryAction={
        <Button
          disabled={allocate.isLoading}
          onClick={() => {
            allocate.mutate(item);
          }}
        >
          {allocate.isLoading ? "Carregando ..." : "Adotar"}
        </Button>
      }
    >
      <ListItemAvatar>
        <Avatar
          alt={item.name}
          src={imageState?.url ?? "https://via.placeholder.com/150"}
          imgProps={{
            width: imageState?.width ?? 150,
            height: imageState?.height ?? 150,
          }}
        />
      </ListItemAvatar>
      <ListItemText
        primary={item.name}
        secondary={
          <Link target="_blank" href={item.exampleUrl}>
            Veja o exemplo
          </Link>
        }
      />
    </ListItem>
  );
}

function FreeItemsList({
  items,
  allocate,
}: {
  items: Item[];
  allocate: UseMutationResult<any, unknown, Item, unknown>;
}) {
  return (
    <Card>
      <Stack direction="column" padding={2}>
        <Typography variant="h5">Lista de Presentes</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Adote um presente!
        </Typography>
      </Stack>
      <List>
        {items.map((item) => (
          <FreeItemListItem key={item.id} item={item} allocate={allocate} />
        ))}
      </List>
    </Card>
  );
}

function UserItemListItem({ item }: { item: Item }) {
  const { imageState } = useItem(item);
  return (
    <ListItem alignItems="flex-start">
      <ListItemAvatar>
        <Avatar
          alt={item.name}
          src={imageState?.url ?? "https://via.placeholder.com/150"}
          imgProps={{
            width: imageState?.width ?? 150,
            height: imageState?.height ?? 150,
          }}
        />
      </ListItemAvatar>
      <ListItemText
        primary={item.name}
        secondary={
          <Link target="_blank" href={item.exampleUrl}>
            Veja o exemplo
          </Link>
        }
      />
    </ListItem>
  );
}

function PixSection() {
  const pixCode = "luigiminardim@gmail.com";
  const { copied, copy } = useClipboard();
  return (
    <Card sx={{ padding: 2 }}>
      <Stack direction="column" spacing={2}>
        <Typography variant="h5">Ajude com um PIX</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Copiar e-mail como chave PIX
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button startIcon={<ContentCopyIcon />} onClick={() => copy(pixCode)}>
            {copied ? "E-mail copiado" : "Copiar Chave PIX"}
          </Button>
        </Box>
      </Stack>
    </Card>
  );
}

function UserItemsList({ user, items }: { user: User; items: Item[] }) {
  return (
    <Card>
      <Stack direction="column" padding={2}>
        <Typography variant="h5">Olá, {user.name}!</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {items.length > 0
            ? "Aqui estão suas adoções."
            : "Você ainda não possui nenhuma adoção."}
        </Typography>
      </Stack>
      {items.length > 0 && (
        <List>
          {items.map((item) => (
            <UserItemListItem key={item.id} item={item} />
          ))}
        </List>
      )}
    </Card>
  );
}
export default function Main() {
  const { user, onLogin } = useUser();
  const {
    isLoading: isLoadingItems,
    error: itemsError,
    freeItems,
    userItems,
    allocateItem,
  } = useItems({ user });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle, rgba(243,227,234,0.5216796191132703) 0%, rgba(211,226,244,1) 100%)",
        paddingY: { xs: 2, md: 4 },
      }}
    >
      <Snackbar
        open={!!itemsError}
        autoHideDuration={10 * 1000}
        message={itemsError}
      />
      <UserDialog user={user} onLogin={onLogin} />
      <Container fixed maxWidth="lg">
        <Grid container columns={{ xs: 1, md: 2 }} spacing={4}>
          <Grid item xs={1}>
            <Header />
          </Grid>
          <Grid item xs={1}>
            <Stack spacing={4}>
              {user && userItems ? (
                <UserItemsList user={user} items={userItems} />
              ) : (
                <Skeleton variant="rectangular" width={"100%"} height={118} />
              )}
              <PixSection />
              {freeItems ? (
                <FreeItemsList items={freeItems} allocate={allocateItem} />
              ) : (
                <Skeleton variant="rectangular" width={"100%"} height={118} />
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
