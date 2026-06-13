using FartSocial.Domain.Common;
using FartSocial.Domain.Devices;
using FartSocial.Domain.Social;

namespace FartSocial.Domain.FartEvents;

public sealed class FartEvent : Entity
{
    public Guid UserId { get; set; }
    public Guid DeviceId { get; set; }
    public Guid? AudioFileId { get; set; }
    public DateTimeOffset OccurredAt { get; set; }
    public int AudioLevel { get; set; }
    public int GasLevel { get; set; }
    public decimal Temperature { get; set; }
    public int DurationMs { get; set; }
    public int LocalScore { get; set; }
    public int OfficialScore { get; set; }
    public int AuthenticityScore { get; set; }
    public bool IsAuthenticated { get; set; }
    public string Category { get; set; } = "common";
    public FartVisibility Visibility { get; set; } = FartVisibility.Private;
    public string RewardsJson { get; set; } = "[]";
    public string BadgesJson { get; set; } = "[]";

    public Device? Device { get; set; }
    public FartAudioFile? AudioFile { get; set; }
    public ICollection<Reaction> Reactions { get; set; } = new List<Reaction>();
}
