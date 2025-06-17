SELECT
    t.trip_id,
    t.route_id,
    t.trip_headsign,
    s.stop_name,
    s.stop_lat,
    s.stop_lon,
    st.arrival_time,
    st.departure_time
FROM trips AS t
LEFT JOIN stop_times AS st
    ON t.trip_id = st.trip_id
LEFT JOIN stops AS s
    ON st.stop_id = s.stop_id
WHERE t.trip_id = :trip_id
ORDER BY
    t.trip_id,
    st.stop_sequence;