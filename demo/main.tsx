import React, { useMemo, useState, type ComponentProps } from "react";
import { createRoot } from "react-dom/client";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MuiPhoneNumber from "../src";

type MuiPhoneNumberProps = ComponentProps<typeof MuiPhoneNumber>;

interface StoryDefinition {
  id: string;
  label: string;
  props: MuiPhoneNumberProps;
}

interface StoryCardProps {
  story: StoryDefinition;
}

const StoryCard = ({ story }: StoryCardProps): React.JSX.Element => {
  const [value, setValue] = useState<string>(story.props.value ?? "");

  return (
    <Paper elevation={1} sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle2" color="text.secondary">
          {story.label}
        </Typography>
        <MuiPhoneNumber
          {...story.props}
          value={value}
          onChange={(nextValue): void => {
            setValue(nextValue);
          }}
        />
        <Alert severity="info" variant="outlined">
          Value: <code>{value || "(empty)"}</code>
        </Alert>
      </Stack>
    </Paper>
  );
};

const App = (): React.JSX.Element => {
  const stories = useMemo(
    (): StoryDefinition[] => [
      {
        id: "basic",
        label: "Basic",
        props: { disableAreaCodes: true },
      },
      {
        id: "preferred",
        label: "Preferred Countries (br, it, se, de, fr)",
        props: {
          defaultCountry: "br",
          preferredCountries: ["br", "it", "se", "de", "fr"],
        },
      },
      {
        id: "only",
        label: "Only Countries (gb, es, fr, de, it)",
        props: {
          defaultCountry: "gb",
          onlyCountries: ["gb", "es", "fr", "de", "it"],
        },
      },
      {
        id: "exclude",
        label: "Exclude Countries (us, ca)",
        props: {
          defaultCountry: "no",
          excludeCountries: ["us", "ca"],
        },
      },
      {
        id: "regions",
        label: "Regions: Europe",
        props: {
          defaultCountry: "it",
          regions: "europe",
        },
      },
      {
        id: "disabled",
        label: "Disabled",
        props: {
          defaultCountry: "us",
          disabled: true,
          value: "+1 555 123 4567",
        },
      },
      {
        id: "error",
        label: "Error State",
        props: {
          defaultCountry: "us",
          error: true,
          value: "invalid",
        },
      },
      {
        id: "placeholder",
        label: "Custom Placeholder",
        props: {
          defaultCountry: "us",
          placeholder: "+1 (555) 123-4567",
        },
      },
      {
        id: "localization",
        label: "Localization",
        props: {
          onlyCountries: ["de", "es", "fr"],
          localization: {
            Germany: "Deutschland",
            Spain: "España",
            France: "France",
          },
        },
      },
      {
        id: "disable-dropdown",
        label: "Disable Dropdown",
        props: {
          defaultCountry: "us",
          onlyCountries: ["us"],
          disableDropdown: true,
        },
      },
      {
        id: "disable-country-code",
        label: "Disable Country Code",
        props: {
          defaultCountry: "us",
          disableCountryCode: true,
        },
      },
    ],
    [],
  );

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Typography variant="h4" component="h1">
            MUI Phone Number Demo
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {stories.map((story: StoryDefinition) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </Box>
        </Stack>
      </Container>
    </>
  );
};

const container = document.getElementById("root");

if (!container) {
  throw new Error("Demo root container not found");
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
