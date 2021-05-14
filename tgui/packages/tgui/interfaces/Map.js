import { useBackend, useLocalState } from '../backend';
import { Window } from '../layouts';

export const Map = (props, context) => {
  const { data } = useBackend(context);
  const { map_name, map_size_x, map_size_y } = data;

  const [isScrolling, setScrolling] = useLocalState(context, "is_scrolling", false);

  const [lastMousePos, setLastMousePos] = useLocalState(context, "last_mouse_pos", null);

  const startDragging = e => {
    setLastMousePos(null);
    setScrolling(true);
  };

  const stopDragging = e => {
    setScrolling(false);
  };

  const doDrag = e => {
    if (isScrolling) {
      const { screenX, screenY } = e;
      const element = document.getElementById("minimap");
      if (lastMousePos) {
        element.scrollLeft = element.scrollLeft + lastMousePos[0] - screenX;
        element.scrollTop = element.scrollTop + lastMousePos[1] - screenY;
      }
      setLastMousePos([screenX, screenY]);
    }
  };

  const globalToLocal = coord => {
    const element = document.getElementById("minimap");
    const newCoord = [];
    newCoord[0] = (coord[0])*icon_size + element.scrollTop;
    newCoord[1] = (map_size_y-coord[1]*icon_size) + element.scrollLeft;

    if (newCoord[0] < 0 || newCoord[0] > icon_size*player_viewsize
      || newCoord[1] < 0 || newCoord[1] > icon_size*player_viewsize) {
      return null;
    }
    return newCoord;
  };

  return (
    <Window
      width={icon_size*player_viewsize + 25}
      height={icon_size*player_viewsize + 50}
      theme="engi"
    >
      <Window.Content id="minimap">
        <Stack justify="space-around">
          <Stack.Item>
            <Box
              className="Minimap__Map"
              style={{
                'background-image': `url('minimap.${map_name}.png')`,
                'background-repeat': "no-repeat",
                'background-position-x': `${background_loc[0]}px`,
                'background-position-y': `${background_loc[1]}px`,
                'width': `${icon_size*player_viewsize}px`,
                'height': `${icon_size*player_viewsize}px`,
              }}
              onClick={() => setSelectedName(null)}
              onMouseDown={startDragging}
              onMouseUp={stopDragging}
              onMouseMove={doDrag}
            >
              {coord_data.map(val => {
                const local_coord = globalToLocal(object_coord);
                if (!local_coord) return;
                return (
                  <Object
                    key={val.ref}
                    name={val.name}
                    coord={local_coord}
                    icon={val.icon}
                    color={val.color}
                    obj_ref={val.ref}
                    obj_width={val.width}
                    obj_height={val.height}
                  />
                );
              })}
            </Box>
          </Stack.Item>
        </Stack>
      </Window.Content>
    </Window>
  );
};

export const Object = (props, context) => {
  const { data } = useBackend(context);
  const { icon_size } = data;
  const {
    name,
    coord,
    icon,
    color,
    obj_ref,
    obj_width,
    obj_height,
    ...rest
  } = props;

  const [selectedName, setSelectedName] = useLocalState(context, "selected_name", null);
  let object_opacity = 1;

  if (selectedName && selectedName !== obj_ref) {
    object_opacity = 0.4;
  }

  return (
    <Box
      className="Minimap__Player"
      opacity={object_opacity}
      width="10%"
      onClick={e => {
        setSelectedName(obj_ref);
        e.stopPropagation();
      }}
      {...rest}
      position="absolute"
      left={`${coord[0]+icon_size/2}px`}
      top={`${coord[1]+icon_size-((obj_height-1)*icon_size)}px`}
    >
      <Stack vertical fill>
        <Stack.Item>
          <Box
            as="span"
            className="Minimap__Player_Icon"
            position="absolute"
            backgroundColor={color}
            width={`${icon_size*obj_width}px`}
            height={`${icon_size*obj_height}px`}
          />
        </Stack.Item>
        <Stack.Item
          className="Minimap__InfoBox"
          ml={selectedName === obj_ref
            ? `${icon_size*obj_width}px`
            : `${(icon_size*obj_width)/2}px`}
          mt={selectedName === obj_ref
            ? `${icon_size*obj_height}px`
            : `${(obj_height-1)*icon_size}px`}>
          <Box
            position="absolute"
            px={1}
            py={1}
            className={`Minimap__InfoBox${
              selectedName === obj_ref? "--detailed" : ""}`}
          >
            <Stack>
              {selectedName === obj_ref && (
                <Stack.Item>
                  <Icon name={icon} />
                </Stack.Item>
              )}
              <Stack.Item>
                {name}
              </Stack.Item>
            </Stack>
          </Box>
        </Stack.Item>
      </Stack>
    </Box>
  );
};
