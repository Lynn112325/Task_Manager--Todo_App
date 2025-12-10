import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import PropTypes from "prop-types";
import * as React from "react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import OptionsMenu from "./OptionsMenu";

import AssignmentIcon from "@mui/icons-material/Assignment";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import BarChartIcon from "@mui/icons-material/BarChart";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import LayersIcon from "@mui/icons-material/Layers";
import { matchPath, useLocation } from "react-router";
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from "../constants";
import DashboardSidebarContext from "../context/DashboardSidebarContext";
import {
  getDrawerSxTransitionMixin,
  getDrawerWidthTransitionMixin,
} from "../mixins";
import DashboardSidebarDividerItem from "./DashboardSidebarDividerItem";
import DashboardSidebarHeaderItem from "./DashboardSidebarHeaderItem";
import DashboardSidebarPageItem from "./DashboardSidebarPageItem";

function DashboardSidebar({
  expanded = true,
  setExpanded,
  disableCollapsibleSidebar = false,
  container,
}) {
  const theme = useTheme();
  const { user, loading, error } = useCurrentUser();

  // Define the task pages
  const taskPages = [
    {
      id: "toDoTasks",
      title: "To Do Tasks",
      icon: <CalendarMonthIcon />,
      href: "/tasks/todo",
      match: "/tasks/todo",
    },
    {
      id: "allTasks",
      title: "All Tasks",
      icon: <AssignmentTurnedInIcon />,
      href: "/tasks",
      match: "/tasks",
    },
  ];

  const { pathname } = useLocation();

  const [expandedItemIds, setExpandedItemIds] = React.useState([]);

  const isOverSmViewport = useMediaQuery(theme.breakpoints.up("sm"));
  const isOverMdViewport = useMediaQuery(theme.breakpoints.up("md"));

  const [isFullyExpanded, setIsFullyExpanded] = React.useState(expanded);
  const [isFullyCollapsed, setIsFullyCollapsed] = React.useState(!expanded);

  React.useEffect(() => {
    if (expanded) {
      const drawerWidthTransitionTimeout = setTimeout(() => {
        setIsFullyExpanded(true);
      }, theme.transitions.duration.enteringScreen);

      return () => clearTimeout(drawerWidthTransitionTimeout);
    }

    setIsFullyExpanded(false);

    return () => { };
  }, [expanded, theme.transitions.duration.enteringScreen]);

  React.useEffect(() => {
    if (!expanded) {
      const drawerWidthTransitionTimeout = setTimeout(() => {
        setIsFullyCollapsed(true);
      }, theme.transitions.duration.leavingScreen);

      return () => clearTimeout(drawerWidthTransitionTimeout);
    }

    setIsFullyCollapsed(false);

    return () => { };
  }, [expanded, theme.transitions.duration.leavingScreen]);

  const mini = !disableCollapsibleSidebar && !expanded;

  const handleSetSidebarExpanded = React.useCallback(
    (newExpanded) => () => {
      setExpanded(newExpanded);
    },
    [setExpanded]
  );

  const handlePageItemClick = React.useCallback(
    (itemId, hasNestedNavigation) => {
      if (hasNestedNavigation && !mini) {
        setExpandedItemIds((previousValue) =>
          previousValue.includes(itemId)
            ? previousValue.filter(
              (previousValueItemId) => previousValueItemId !== itemId
            )
            : [...previousValue, itemId]
        );
      } else if (!isOverSmViewport && !hasNestedNavigation) {
        setExpanded(false);
      }
    },
    [mini, setExpanded, isOverSmViewport]
  );

  const hasDrawerTransitions =
    isOverSmViewport && (!disableCollapsibleSidebar || isOverMdViewport);

  const getDrawerContent = React.useCallback(
    (viewport) => (
      <React.Fragment>
        <Toolbar />
        <Box
          component="nav"
          aria-label={`${viewport.charAt(0).toUpperCase()}${viewport.slice(1)}`}
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "auto",
            scrollbarGutter: mini ? "stable" : "auto",
            overflowX: "hidden",
            pt: !mini ? 0 : 2,
            ...(hasDrawerTransitions
              ? getDrawerSxTransitionMixin(isFullyExpanded, "padding")
              : {}),
          }}
        >
          <List
            dense
            sx={{
              padding: mini ? 0 : 0.5,
              mb: 4,
              width: mini ? MINI_DRAWER_WIDTH : "auto",
            }}
          >
            <DashboardSidebarHeaderItem>Main items</DashboardSidebarHeaderItem>
            <DashboardSidebarPageItem
              id="dashboard"
              title="Dashboard"
              icon={<DashboardIcon />}
              href="/dashboard"
              selected={!!matchPath("/dashboard", pathname) || pathname === "/"}
            />
            <DashboardSidebarPageItem
              id="tasks"
              title="Tasks"
              href="/tasks"
              icon={<AssignmentIcon />}
              expanded={expandedItemIds.includes("tasks")}
              nestedNavigation={
                <List
                  dense
                  sx={{
                    padding: 0,
                    my: 1,
                    pl: mini ? 0 : 1,
                    minWidth: 240,
                  }}
                >
                  {taskPages.map((page) => (
                    <DashboardSidebarPageItem
                      key={page.id}
                      id={page.id}
                      title={page.title}
                      icon={page.icon}
                      href={page.href}
                      selected={!!matchPath(page.match, pathname)}
                    />
                  ))}
                </List>
              }
            />
            {/* <DashboardSidebarPageItem
              id="personal"
              title="Personal"
              icon={<PersonIcon />}
              href="/personal"
              selected={!!matchPath('/personal/*', pathname) || pathname === '/'}
            /> */}
            <DashboardSidebarDividerItem />
            <DashboardSidebarHeaderItem>Other items</DashboardSidebarHeaderItem>
            <DashboardSidebarPageItem
              id="reports"
              title="Reports"
              icon={<BarChartIcon />}
              href="/reports"
              selected={!!matchPath("/reports", pathname)}
              defaultExpanded={!!matchPath("/reports", pathname)}
              expanded={expandedItemIds.includes("reports")}
              nestedNavigation={
                <List
                  dense
                  sx={{
                    padding: 0,
                    my: 1,
                    pl: mini ? 0 : 1,
                    minWidth: 240,
                  }}
                >
                  <DashboardSidebarPageItem
                    id="tasks"
                    title="Tasks"
                    icon={<DescriptionIcon />}
                    href="/reports/tasks"
                    selected={!!matchPath("/reports/tasks", pathname)}
                  />
                  {/* <DashboardSidebarPageItem
                    id="traffic"
                    title="Traffic"
                    icon={<DescriptionIcon />}
                    href="/reports/traffic"
                    selected={!!matchPath('/reports/traffic', pathname)}
                  /> */}
                </List>
              }
            />
            <DashboardSidebarPageItem
              id="integrations"
              title="Integrations"
              icon={<LayersIcon />}
              href="/integrations"
              selected={!!matchPath("/integrations", pathname)}
            />
          </List>
          {/* current user's info */}
          <Stack
            direction="row"
            sx={{
              p: 2,
              gap: 1,
              alignItems: "center",
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            {expanded && (
              <Avatar
                sizes="small"
                alt=""
                src="/"
                sx={{ width: 36, height: 36 }}
              />
            )}
            {expanded && (
              <Box sx={{ mr: "auto" }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, lineHeight: "16px" }}
                >
                  {loading ? (
                    <Skeleton width={50} />
                  ) : (
                    user?.username ?? "No user"
                  )}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {loading ? (
                    <Skeleton width={100} />
                  ) : (
                    user?.email ?? "No user"
                  )}
                </Typography>
              </Box>
            )}
            <OptionsMenu />
          </Stack>
        </Box>
      </React.Fragment>
    ),
    [
      mini,
      hasDrawerTransitions,
      isFullyExpanded,
      expandedItemIds,
      pathname,
      user,
      loading,
    ]
  );

  const getDrawerSharedSx = React.useCallback(
    (isTemporary) => {
      const drawerWidth = mini ? MINI_DRAWER_WIDTH : DRAWER_WIDTH;

      return {
        displayPrint: "none",
        width: drawerWidth,
        flexShrink: 0,
        ...getDrawerWidthTransitionMixin(expanded),
        ...(isTemporary ? { position: "absolute" } : {}),
        [`& .MuiDrawer-paper`]: {
          position: "absolute",
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundImage: "none",
          ...getDrawerWidthTransitionMixin(expanded),
        },
      };
    },
    [expanded, mini]
  );

  const sidebarContextValue = React.useMemo(() => {
    return {
      onPageItemClick: handlePageItemClick,
      mini,
      fullyExpanded: isFullyExpanded,
      fullyCollapsed: isFullyCollapsed,
      hasDrawerTransitions,
    };
  }, [
    handlePageItemClick,
    mini,
    isFullyExpanded,
    isFullyCollapsed,
    hasDrawerTransitions,
  ]);

  return (
    <DashboardSidebarContext.Provider value={sidebarContextValue}>
      <Drawer
        container={container}
        variant="temporary"
        open={expanded}
        onClose={handleSetSidebarExpanded(false)}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: {
            xs: "block",
            sm: disableCollapsibleSidebar ? "block" : "none",
            md: "none",
          },
          ...getDrawerSharedSx(true),
        }}
      >
        {getDrawerContent("phone")}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: {
            xs: "none",
            sm: disableCollapsibleSidebar ? "none" : "block",
            md: "none",
          },
          ...getDrawerSharedSx(false),
        }}
      >
        {getDrawerContent("tablet")}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          ...getDrawerSharedSx(false),
        }}
      >
        {getDrawerContent("desktop")}
      </Drawer>
    </DashboardSidebarContext.Provider>
  );
}

DashboardSidebar.propTypes = {
  container: (props, propName) => {
    if (props[propName] == null) {
      return null;
    }
    if (typeof props[propName] !== "object" || props[propName].nodeType !== 1) {
      return new Error(`Expected prop '${propName}' to be of type Element`);
    }
    return null;
  },
  disableCollapsibleSidebar: PropTypes.bool,
  expanded: PropTypes.bool,
  setExpanded: PropTypes.func.isRequired,
};

export default DashboardSidebar;
