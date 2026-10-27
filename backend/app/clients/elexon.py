import os
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

class ElexonClient:
    def __init__(self, base_url: Optional[str] = None, cache_dir: Optional[str] = None):
        self.base_url = (base_url or settings.ELEXON_BASE_URL).rstrip("/")
        self.timeout = settings.ELEXON_TIMEOUT_SECONDS
        self.max_retries = settings.ELEXON_MAX_RETRIES
        
        # Determine cache directory
        if cache_dir:
            self.cache_path = Path(cache_dir)
        else:
            self.cache_path = Path(os.getcwd()) / settings.CACHE_DIR
        self.cache_path.mkdir(parents=True, exist_ok=True)

    def _get_cache_file(self, dataset: str, start_iso: str, end_iso: str) -> Path:
        safe_start = start_iso.replace(":", "-").replace("+", "_")
        safe_end = end_iso.replace(":", "-").replace("+", "_")
        return self.cache_path / f"{dataset}_{safe_start}_{safe_end}.json"

    async def _fetch_stream(self, endpoint: str, params: Dict[str, str]) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        headers = {
            "Accept": "application/json",
            "User-Agent": "WindLens-Analytics/1.0 (Day-Ahead Forecasting; Elexon BMRS API)"
        }
        
        last_error = None
        for attempt in range(1, self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.get(url, params=params, headers=headers)
                    if response.status_code == 200:
                        return response.json()
                    elif response.status_code == 404:
                        logger.warning(f"Elexon returned 404 for {url} with params {params}")
                        return []
                    else:
                        logger.warning(f"Elexon returned status {response.status_code} on attempt {attempt}")
                        response.raise_for_status()
            except Exception as e:
                last_error = e
                logger.warning(f"Error fetching from Elexon (attempt {attempt}/{self.max_retries}): {e}")
        
        if last_error:
            logger.error(f"Failed to fetch {url} after {self.max_retries} attempts: {last_error}")
            raise last_error
        return []

    async def get_fuelhh_wind_actuals(
        self, start_iso: str, end_iso: str, use_cache: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Fetch FUELHH half-hourly outturn for fuelType=WIND between start_iso and end_iso.
        """
        cache_file = self._get_cache_file("FUELHH_WIND", start_iso, end_iso)
        if use_cache and cache_file.exists():
            try:
                with open(cache_file, "r", encoding="utf-8") as f:
                    logger.info(f"Loaded cached FUELHH data from {cache_file.name}")
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Failed to read cache file {cache_file}: {e}")

        # Fetch from Elexon API
        # Using publishDateTimeFrom and publishDateTimeTo
        params = {
            "publishDateTimeFrom": start_iso,
            "publishDateTimeTo": end_iso
        }
        raw_data = await self._fetch_stream("datasets/FUELHH/stream", params)
        
        # Filter for WIND fuel type
        wind_records = [
            record for record in raw_data 
            if record.get("fuelType", "").upper() == "WIND"
        ]

        # Save to disk cache
        try:
            with open(cache_file, "w", encoding="utf-8") as f:
                json.dump(wind_records, f)
        except Exception as e:
            logger.warning(f"Failed to write cache file {cache_file}: {e}")

        return wind_records

    async def get_windfor_forecasts(
        self, start_iso: str, end_iso: str, use_cache: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Fetch WINDFOR wind forecasts published between start_iso and end_iso.
        """
        cache_file = self._get_cache_file("WINDFOR", start_iso, end_iso)
        if use_cache and cache_file.exists():
            try:
                with open(cache_file, "r", encoding="utf-8") as f:
                    logger.info(f"Loaded cached WINDFOR data from {cache_file.name}")
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Failed to read cache file {cache_file}: {e}")

        params = {
            "publishDateTimeFrom": start_iso,
            "publishDateTimeTo": end_iso
        }
        forecast_records = await self._fetch_stream("datasets/WINDFOR/stream", params)

        try:
            with open(cache_file, "w", encoding="utf-8") as f:
                json.dump(forecast_records, f)
        except Exception as e:
            logger.warning(f"Failed to write cache file {cache_file}: {e}")

        return forecast_records
