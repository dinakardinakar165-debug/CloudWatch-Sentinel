import os
import logging
import datetime
from typing import Dict, Any, List, Optional
import boto3
from botocore.exceptions import ClientError, BotoCoreError

logger = logging.getLogger(__name__)

class AWSCloudClient:
    """
    AWS Integration Client using boto3 for AWS CloudWatch and Cost Explorer APIs.
    Supports assumed IAM roles, environment credentials, and graceful fallback to synthetic demo metrics.
    """

    def __init__(
        self,
        role_arn: Optional[str] = None,
        external_id: Optional[str] = None,
        region_name: str = "us-east-1"
    ):
        self.role_arn = role_arn
        self.external_id = external_id
        self.region_name = region_name or os.getenv("AWS_DEFAULT_REGION", "us-east-1")
        self._session = self._create_session()

    def _create_session(self) -> boto3.Session:
        """Create a boto3 session, using IAM Role Assumption if provided, or environment variables."""
        if self.role_arn and self.external_id:
            try:
                sts_client = boto3.client("sts", region_name=self.region_name)
                assumed_role = sts_client.assume_role(
                    RoleArn=self.role_arn,
                    RoleSessionName="CloudWatchSentinelSession",
                    ExternalId=self.external_id
                )
                creds = assumed_role["Credentials"]
                return boto3.Session(
                    aws_access_key_id=creds["AccessKeyId"],
                    aws_secret_access_key=creds["SecretAccessKey"],
                    aws_session_token=creds["SessionToken"],
                    region_name=self.region_name
                )
            except (ClientError, BotoCoreError) as e:
                logger.warning(f"Failed to assume AWS Role {self.role_arn}: {e}. Falling back to default session.")

        # Fallback to standard environment or default boto3 session
        return boto3.Session(region_name=self.region_name)

    def validate_connection(self) -> Dict[str, Any]:
        """Validate AWS STS connection and caller identity."""
        try:
            sts = self._session.client("sts")
            identity = sts.get_caller_identity()
            return {
                "connected": True,
                "account": identity.get("Account"),
                "arn": identity.get("Arn"),
                "userId": identity.get("UserId"),
                "mode": "live"
            }
        except Exception as e:
            logger.info(f"AWS connection validation unverified ({e}). Platform running in Demo Mode.")
            return {
                "connected": False,
                "account": "123456789012",
                "arn": self.role_arn or "arn:aws:iam::123456789012:role/CloudWatchSentinelReadOnly",
                "userId": "sentinel-demo-user",
                "mode": "demo",
                "error": str(e)
            }

    def get_cloudwatch_metrics(
        self,
        instance_ids: Optional[List[str]] = None,
        hours: int = 24
    ) -> List[Dict[str, Any]]:
        """Fetch EC2 CPUUtilization metrics from AWS CloudWatch, or return fallback telemetry."""
        now = datetime.datetime.now(datetime.timezone.utc)
        start_time = now - datetime.timedelta(hours=hours)

        try:
            cw = self._session.client("cloudwatch")
            metrics_data = []

            target_instances = instance_ids or ["i-0123456789abcdef0", "i-0987654321fedcba0"]
            for inst_id in target_instances:
                response = cw.get_metric_statistics(
                    Namespace="AWS/EC2",
                    MetricName="CPUUtilization",
                    Dimensions=[{"Name": "InstanceId", "Value": inst_id}],
                    StartTime=start_time,
                    EndTime=now,
                    Period=3600,
                    Statistics=["Average", "Maximum"]
                )

                datapoints = response.get("Datapoints", [])
                for dp in datapoints:
                    metrics_data.append({
                        "resourceId": inst_id,
                        "metricName": "CPUUtilization",
                        "timestamp": dp["Timestamp"].isoformat(),
                        "average": round(dp.get("Average", 0), 2),
                        "maximum": round(dp.get("Maximum", 0), 2),
                        "unit": dp.get("Unit", "Percent"),
                        "source": "aws"
                    })

            if metrics_data:
                return sorted(metrics_data, key=lambda x: x["timestamp"])

        except Exception as e:
            logger.info(f"CloudWatch API query unavailable ({e}). Using deterministic metric telemetry.")

        # Deterministic Demo Mode fallback metrics
        fallback_metrics = []
        for i in range(hours):
            ts = (now - datetime.timedelta(hours=hours - i)).isoformat()
            fallback_metrics.append({
                "resourceId": "i-0123456789abcdef0",
                "metricName": "CPUUtilization",
                "timestamp": ts,
                "average": round(25.0 + (i % 7) * 4.2, 2),
                "maximum": round(45.0 + (i % 5) * 8.5, 2),
                "unit": "Percent",
                "source": "demo"
            })
        return fallback_metrics

    def get_cost_and_usage(self, days: int = 30) -> List[Dict[str, Any]]:
        """Fetch cost breakdowns from AWS Cost Explorer API, or generate deterministic cost records."""
        end_date = datetime.date.today()
        start_date = end_date - datetime.timedelta(days=days)

        try:
            ce = self._session.client("ce")
            response = ce.get_cost_and_usage(
                TimePeriod={
                    "Start": start_date.strftime("%Y-%m-%d"),
                    "End": end_date.strftime("%Y-%m-%d")
                },
                Granularity="DAILY",
                Metrics=["UnblendedCost"],
                GroupBy=[{"Type": "DIMENSION", "Key": "SERVICE"}]
            )

            results = []
            for time_period in response.get("ResultsByTime", []):
                date_str = time_period["TimePeriod"]["Start"]
                for group in time_period.get("Groups", []):
                    service_name = group["Keys"][0]
                    amount = float(group["Metrics"]["UnblendedCost"]["Amount"])
                    currency = group["Metrics"]["UnblendedCost"]["Unit"]
                    results.append({
                        "date": date_str,
                        "service": service_name,
                        "amount": round(amount, 2),
                        "currency": currency,
                        "source": "aws"
                    })

            if results:
                return results

        except Exception as e:
            logger.info(f"Cost Explorer API unavailable ({e}). Using cost collector service.")

        return []
