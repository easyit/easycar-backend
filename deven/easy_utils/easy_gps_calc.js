/**
 * Created with JetBrains WebStorm.
 * User: Deven
 * Date: 12-11-28
 * Time: 下午5:12
 * To change this template use File | Settings | File Templates.
 */


/*
using System;
using System.Collections.Generic;
using System.Text;

namespace Bsmart.BDT.Components
{
    /// <summary>
    /// Calculate Distance using Latitudes and Longitudes
    /// From: http://www.esanu.name/delphi/Algorithms/Maths/Calculate%20Distance%20using%20Latitudes%20and%20Longitudes.html
    /// </summary>
    public class GPSCalculateUtil
    {
        // Constants used within the Bearing and Distance calculations
        public const double D2R = 0.017453; // Degrees to Radians Conversion
        public const double R2D = 57.295781; // Radians to Degrees Conversion
        public const double a = 6378137.0; // Major semi-axis
        public const double b = 6356752.314245; // Minor semi-axis
        public const double e2 = 0.006739496742337; // Square of eccentricity of ellipsoid
        public const double f = 0.003352810664747; // Flattening of ellipsoid

        // Variables used within the Bearing and Distance calculations
        private static double fPhimean; // Mean latitude
        private static double fdLambda; // Longitude difference
        private static double fdPhi; // Latitude difference
        private static double fAlpha; // Bearing
        private static double fRho; // Meridional radius of curvature
        private static double fNu; // Transverse radius of curvature
        private static double fR; // Radius of spherical earth
        private static double fz; // Angular distance at centre of spheroid
        private static double fTemp; // Temporary variable used in calculations
        private static double Distance; // Calculated distance in meters
        private static double Bearing; // Calculated bearing FROM Start TO

        private static object _classLocker = new object();


        /// <summary>
        ///
        /// </summary>
        /// <param name="StartLong">Start Longitude, Degrees and hundredths</param>
        /// <param name="StartLat">Start Latitude, Degrees and hundredths</param>
        /// <param name="EndLong">End Longitude, Degrees and hundredths</param>
        /// <param name="EndLat">End Latitude, Degrees and hundredths</param>
        private static void PreCalc(double StartLong, double StartLat, double EndLong, double EndLat)
        {
            lock (_classLocker)
            {

                // Get difference between longitudes and latitudes and mean latitude
                fdLambda = (StartLong - EndLong) * D2R;
                fdPhi = (StartLat - EndLat) * D2R;
                fPhimean = ((StartLat + EndLat) / 2.0) * D2R;

                // Calculate meridional and traverse radii of curvature at mean latitude
                fTemp = 1 - e2 * (Math.Pow(Math.Sin(fPhimean), 2));
                fRho = (a * (1 - e2)) / Math.Pow(fTemp, 1.5);
                fNu = a / (Math.Sqrt(1 - e2 * (Math.Sin(fPhimean) * Math.Sin(fPhimean))));

                // Calculate angular distance
                fz = Math.Sqrt(Math.Pow(Math.Sin(fdPhi / 2.0), 2) + Math.Cos(EndLat * D2R) * Math.Cos(StartLat * D2R) * Math.Pow(Math.Sin(fdLambda / 2.0), 2));
                fz = 2 * Math.Asin(fz);

                // Calculate bearing
                fAlpha = Math.Cos(EndLat * D2R) * Math.Sin(fdLambda) * 1 / Math.Sin(fz);
                fAlpha = Math.Asin(fAlpha);

                // Use Eular's Thereom to determine radius of the earth
                fR = (fRho * fNu) / ((fRho * Math.Pow(Math.Sin(fAlpha), 2)) + (fNu * Math.Pow(Math.Cos(fAlpha), 2)));
            }
        }

        /// <summary>
        ///
        /// </summary>
        /// <param name="StartLong">Start Longitude, Degrees and hundredths</param>
        /// <param name="StartLat">Start Latitude, Degrees and hundredths</param>
        /// <param name="EndLong">End Longitude, Degrees and hundredths</param>
        /// <param name="EndLat">End Latitude, Degrees and hundredths</param>
        /// <returns>Distance in Metres</returns>
        public static double CalcDistance(double StartLong, double StartLat, double EndLong, double EndLat)
        {
            lock (_classLocker)
            {
                PreCalc(StartLong, StartLat, EndLong, EndLat);

                // Set Distance
                Distance = (fz * fR);

                return Distance;
            }
        }


        /// <summary>
        ///
        /// </summary>
        /// <param name="StartLong">Start Longitude, Degrees and hundredths</param>
        /// <param name="StartLat">Start Latitude, Degrees and hundredths</param>
        /// <param name="EndLong">End Longitude, Degrees and hundredths</param>
        /// <param name="EndLat">End Latitude, Degrees and hundredths</param>
        /// <returns>Bearing in degrees</returns>
        public static double CalcBearing(double StartLong, double StartLat, double EndLong, double EndLat)
        {

            lock(_classLocker)
            {
                PreCalc(StartLong, StartLat, EndLong, EndLat);

                // Set Bearing
                if ((StartLat < EndLat) && (StartLong < EndLong))
                    Bearing = Math.Abs(fAlpha * R2D);
                else if ((StartLat < EndLat) && (StartLong > EndLong))
                    Bearing = 360 - Math.Abs(fAlpha * R2D);
                else if ((StartLat > EndLat) && (StartLong > EndLong))
                    Bearing = 180 + Math.Abs(fAlpha * R2D);
                else if ((StartLat > EndLat) && (StartLong < EndLong))
                    Bearing = 180 - Math.Abs(fAlpha * R2D);

                return Bearing;
            }
        }



        private const double EARTH_RADIUS = 6378.137;

        private static double rad(double d)
        {
            return d * Math.PI / 180.0;
        }

        /// <summary>
        /// Cannot be used
        /// </summary>
        /// <param name="lat1"></param>
        /// <param name="lng1"></param>
        /// <param name="lat2"></param>
        /// <param name="lng2"></param>
        /// <returns></returns>
        private static double CalcDistanceByFix(double lat1, double lng1, double lat2, double lng2)
        {
            double radLat1 = rad(lat1);
            double radLat2 = rad(lat2);
            double a = radLat1 - radLat2;
            double b = rad(lng1) - rad(lng2);
            double s = 2 * Math.Asin(Math.Sqrt(Math.Pow(Math.Sin(a / 2), 2) +
            Math.Cos(radLat1) * Math.Cos(radLat2) * Math.Pow(Math.Sin(b / 2), 2)));
            s = s * EARTH_RADIUS;
            s = Math.Round(s * 10000) / 10000;
            return s;
        }



        //Not tried...
        //FCDTools.Distance(new FCD_Point(117.107277,31.980298), new FCD_Point(117.524757, 31.888227))); // 输出70.7公里
        private static double CalculateDistance(double startLongitude, double startLatitude, double endLongitude, double endLatitude)
        {
            double PI = 3.14159265354;         //PI, circumference ratio
            double D2R = 0.017453;            //1 degree equals 0.017453 radian
            double a2 = 6378137.0;             //the radius of the Earth, by meter
            double e2 = 0.006739496742337;     //Square of eccentricity of ellipsoid 椭球偏心率的平方

            if (startLongitude == endLongitude && startLatitude == endLatitude)
            {
                return 0.0;
            }
            else
            {
                double fdLambda = (startLongitude - endLongitude) * D2R;
                double fdPhi = (startLatitude - endLatitude) * D2R;
                double fPhimean = ((startLatitude + endLatitude) / 2.0) * D2R;
                double fTemp = 1 - e2 * (Math.Pow(Math.Sin(fPhimean), 2));

                double fRho = (a2 * (1 - e2)) / Math.Pow(fTemp, 1.5);
                double fNu = a2 / (Math.Sqrt(1 - e2 * (Math.Sin(fPhimean) * Math.Sin(fPhimean))));

                double fz = Math.Sqrt(Math.Pow(Math.Sin(fdPhi / 2.0), 2) + Math.Cos(endLatitude * D2R) * Math.Cos(startLatitude * D2R) * Math.Pow(Math.Sin(fdLambda / 2.0), 2));
                fz = 2 * Math.Asin(fz);

                double fAlpha = Math.Cos(endLatitude * D2R) * Math.Sin(fdLambda) * 1 / Math.Sin(fz);
                fAlpha = Math.Asin(fAlpha);

                double fR = (fRho * fNu) / ((fRho * Math.Pow(Math.Sin(fAlpha), 2)) + (fNu * Math.Pow(Math.Cos(fAlpha), 2)));
                return fz * fR;
            }
        }


    }
}
*/




/**
 * 1. Earth Radius（地球半径）:
 *    See: http://en.wikipedia.org/wiki/Earth_radius
 *    Because the Earth is not perfectly spherical, no single value serves as its natural radius.
 *    Distances from points on the surface to the center range from 6,353 km to 6,384 km (≈3,947–3,968 mi).
 *    Several different ways of modeling the Earth as a sphere each yield a mean radius of 6,371 km (≈3,959 mi).
 *    The standard unit for Earth Radius are: [6378.137 kilometers] OR [3963.192 miles].
 *
 * 2. Angle Unit Distance（一角度单位对应的地球弧长）:
 *    See: http://en.wikipedia.org/wiki/Angle
 *    By considering the Earth as a sphere, the circumference of the earth is (2 * PI * Earth Radius).
 *    1 Angle's arc length equals to (1 / 360) circumference.
 *    So, 1 Angle Unit Distance = ((2 * PI * Earth Radius) / 360) = 111 kilometers(≈69 miles).
 *
 * 3. Radian Unit Distance（一弧度单位对应的地球弧长）:
 *    See: http://en.wikipedia.org/wiki/Radians
 *    By considering the Earth as a sphere, the circumference of the earth is (2 * PI * Earth Radius).
 *    1 Radian = (180 / PI) Angle, 1 Radian's arc length equals to ((180 / PI) / 360) circumference.
 *    So, 1 Radian Unit Distance = (2 * PI * Earth Radius) * ((180 / PI) / 360) = Earth Radius.
 *    Actually, the definition of Radian, is the angle which has the same arc length with radius.
 *    The standard unit for Earth Radius are: [6378.137 kilometers] OR [3963.192 miles].
 *    So, 1 Radian Unit Distance = 6378 kilometers(≈3963 miles).
 *
 * 4. How to get Radian or Angle when you have Arc Length only?
 *    If the arc length is X, the radius is R, then Radian is (X / R).
 *    1 Radian = (180 / PI) Angle, so the Angle is (X / R) / (180 / PI).
 * */


exports.validateLocation = function(locationPoint) {
    //TODO
    return true;
}

/*the arc length unit is KM*/
exports.calcRadianByArcLength = function(arcLength) {
    return arcLength / (6378 * 1.0);
};


