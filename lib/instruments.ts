export interface FlightState {
  pitch: number;
  roll: number;
  airspeed: number;
  altitude: number;
  verticalSpeed: number;
  heading: number;
}
export const initialFlight: FlightState = {
  pitch: 0,
  roll: 0,
  airspeed: 240,
  altitude: 10000,
  verticalSpeed: 0,
  heading: 90,
};
export const normalizeHeading = (value: number) => ((value % 360) + 360) % 360;
export const airspeedAngle = (knots: number) =>
  -150 + (Math.max(0, Math.min(400, knots)) / 400) * 300;
export const vsiAngle = (feet: number) =>
  (Math.max(-2000, Math.min(2000, feet)) / 2000) * 120;
export const altimeterAngles = (feet: number) => ({
  hundreds: ((feet % 1000) / 1000) * 360,
  thousands: ((feet % 10000) / 10000) * 360,
});
