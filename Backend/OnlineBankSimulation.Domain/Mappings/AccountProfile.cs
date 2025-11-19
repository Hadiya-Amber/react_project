using AutoMapper;
using OnlineBank.Core.DTOs.AccountDtos;
using OnlineBank.Core.Models;

namespace OnlineBank.Core.Mappings
{
    public class AccountProfile : Profile
    {
        public AccountProfile()
        {
            CreateMap<Account, AccountReadDto>()
                .ForMember(dest => dest.AccountType, opt => opt.MapFrom(src => src.Type))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User != null ? src.User.FullName : string.Empty))
                .ForMember(dest => dest.UserEmail, opt => opt.MapFrom(src => src.User != null ? src.User.Email : string.Empty))
                .ForMember(dest => dest.BranchName, opt => opt.MapFrom(src => src.Branch != null ? src.Branch.BranchName : string.Empty))
                .ForMember(dest => dest.OpenedDate, opt => opt.MapFrom(src => src.CreatedAt));
            CreateMap<AccountCreateDto, Account>();
            CreateMap<CreateAccountDto, Account>()
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => src.AccountType))
                .ForMember(dest => dest.Balance, opt => opt.MapFrom(src => src.InitialDeposit));
            CreateMap<AccountUpdateDto, Account>();
        }
    }
}