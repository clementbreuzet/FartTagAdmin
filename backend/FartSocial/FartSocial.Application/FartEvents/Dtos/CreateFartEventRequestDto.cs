namespace FartSocial.Application.FartEvents.Dtos;

public sealed record CreateFartEventRequestDto(
    Guid DeviceId,
    DateTimeOffset Timestamp,
    int AudioLevel,
    int GasLevel,
    decimal Temperature,
    int DurationMs,
    int LocalScore,
    Guid? AudioFileId);
