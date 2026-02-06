import AssignmentIcon from "@mui/icons-material/Assignment";
import BarChartIcon from "@mui/icons-material/BarChart";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import InboxIcon from '@mui/icons-material/Inbox';
import LayersIcon from "@mui/icons-material/Layers";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import CircularProgress from '@mui/material/CircularProgress';
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
import { useMemo } from "react";
import { matchPath, useLocation } from "react-router";
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from "../constants";
import DashboardSidebarContext from "../context/DashboardSidebarContext";
import { useAuth } from "../context/UserContext";
import { useTarget } from "../hooks/target/useTarget";
import {
  getDrawerSxTransitionMixin,
  getDrawerWidthTransitionMixin,
} from "../mixins";
import { TYPES, TYPE_CONFIG } from "../utils/types";
import DashboardSidebarDividerItem from "./DashboardSidebarDividerItem";
import DashboardSidebarHeaderItem from "./DashboardSidebarHeaderItem";
import DashboardSidebarPageItem from "./DashboardSidebarPageItem";
import OptionsMenu from "./OptionsMenu";

function DashboardSidebar({
  expanded = true,
  setExpanded,
  disableCollapsibleSidebar = false,
  container,
}) {
  const theme = useTheme();
  const { user, loading } = useAuth();
  const { targets, isLoading } = useTarget();

  const targetPages = useMemo(() => {

    return TYPES.map(typeKey => {
      const config = TYPE_CONFIG[typeKey];
      const IconComponent = config.icon;
      const relatedTargets = targets.filter(t => t.type === typeKey);

      return {
        ...config,
        title: config.label,
        icon: IconComponent ? <IconComponent /> : null,
        id: typeKey,
        count: relatedTargets.length,
        href: `/targets/${typeKey}`,
        match: `/targets/${typeKey}`,
        subItems: relatedTargets.map(target => ({
          id: `${target.id}`,
          title: target.title,
          href: `/targets/${target.id}`,
          match: `/targets/${target.id}`,
        }))
      };
    });
  }, [targets]);

  // Define the task pages
  const taskPages = [
    {
      id: "toDoTasks",
      title: "To do",
      // icon: <CalendarMonthIcon />,
      href: "/tasks/todo",
      match: "/tasks/todo",
    },
    // {
    //   id: "allTasks",
    //   title: "All Tasks",
    //   icon: <AssignmentTurnedInIcon />,
    //   href: "/tasks",
    //   match: "/tasks",
    // },
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

  /* Set the expanded item ids based on the current pathname and target pages. */
  React.useEffect(() => {
    if (matchPath("/reports/*", pathname)) {
      setExpandedItemIds(["reports"]);
      return;
    }

    if (matchPath("/tasks/*", pathname)) {
      setExpandedItemIds(["tasks"]);
      return;
    }

    const activeTargetType = targetPages.find(page =>
      matchPath(page.match, pathname) ||
      (page.subItems && page.subItems.some(sub => matchPath(sub.match, pathname)))
    );

    if (activeTargetType) {
      setExpandedItemIds([activeTargetType.id]);
      return;
    }

    setExpandedItemIds([]);
  }, [pathname, targetPages]);

  const handlePageItemClick = React.useCallback(
    (itemId, hasNestedNavigation) => {
      if (hasNestedNavigation && !mini) {
        setExpandedItemIds((previousValue) => {
          const isCurrentlyExpanded = previousValue.includes(itemId);

          return isCurrentlyExpanded ? [] : [itemId];
        });
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
            <DashboardSidebarHeaderItem>Dashboard</DashboardSidebarHeaderItem>
            <DashboardSidebarPageItem
              id="dashboard"
              title="Dashboard"
              icon={<DashboardIcon />}
              href="/dashboard"
              selected={!!matchPath("/dashboard", pathname) || pathname === "/"}
            />
            <DashboardSidebarDividerItem />
            <DashboardSidebarHeaderItem>Tasks</DashboardSidebarHeaderItem>
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
            <DashboardSidebarHeaderItem>Targets</DashboardSidebarHeaderItem>
            <DashboardSidebarPageItem
              id="inbox"
              title="inbox"
              icon={<InboxIcon />}
              href="/inbox"
              selected={!!matchPath("/inbox", pathname) || pathname === "/"}
            />

            {targetPages.map((page) => (
              <DashboardSidebarPageItem
                key={page.id}
                id={page.id}
                title={page.title}
                icon={page.icon}
                href={page.href}
                count={page.count}
                selected={!!matchPath(page.match, pathname)}
                expanded={expandedItemIds.includes(page.id)}
                nestedNavigation={
                  page.subItems && page.subItems.length > 0 ? (
                    <List dense>
                      {page.subItems.map((target) => (
                        <DashboardSidebarPageItem
                          key={target.id}
                          id={target.id}
                          title={target.title}
                          href={target.href}
                          selected={!!matchPath(target.match, pathname)}
                        />
                      ))}
                    </List>
                  ) : null
                }
              />
            ))}

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
      targets,
      isLoading
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }
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
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  disableCollapsibleSidebar: PropTypes.bool,
  expanded: PropTypes.bool,
  setExpanded: PropTypes.func.isRequired,
};

export default DashboardSidebar;
